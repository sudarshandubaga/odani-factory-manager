import React, { useState, useEffect } from "react";
import { storage } from "../../services/storage";
import { Worker } from "../../types";
import { Plus, Trash, User } from "lucide-react";
import { List, RowComponentProps } from "react-window";

import { toast } from "react-hot-toast";

export const WorkersManager: React.FC = () => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [form, setForm] = useState<Partial<Worker>>({});
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const fetchWorkers = async () => {
            const data = await storage.getWorkers();
            setWorkers(data);
        };
        fetchWorkers();
    }, []);

    const handleSave = async () => {
        if (!form.name || !form.mobile) {
            toast.error("Name and Mobile are required");
            return;
        }
        try {
            const newWorker = await storage.addWorker(form);
            setWorkers([...workers, newWorker]);
            setIsAdding(false);
            setForm({});
            toast.success("Worker added successfully!");
        } catch (error) {
            toast.error("Failed to add worker");
        }
    };

    const handleDelete = async (id: string | number) => {
        if (window.confirm("Are you sure you want to delete this worker?")) {
            try {
                await storage.deleteWorker(id);
                setWorkers(workers.filter((w) => w.id !== id));
                toast.success("Worker deleted");
            } catch (error) {
                toast.error("Failed to delete worker");
            }
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm({ ...form, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn-primary bg-brand-600 text-white px-3 py-2 rounded flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Worker
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white p-6 shadow rounded-lg mb-6 border border-brand-100">
                    <h3 className="text-lg font-medium mb-4">New Worker</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Name"
                            className="input-field border p-2 rounded"
                            value={form.name || ""}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                        <input
                            type="text"
                            placeholder="Mobile (10 digit)"
                            className="input-field border p-2 rounded"
                            maxLength={10}
                            value={form.mobile || ""}
                            onChange={(e) =>
                                setForm({ ...form, mobile: e.target.value })
                            }
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="input-field border p-2 rounded"
                            value={form.email || ""}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                        />
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-500">
                                Photo:
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="text-sm"
                            />
                        </div>
                        <textarea
                            placeholder="Notes"
                            className="col-span-2 border p-2 rounded"
                            value={form.notes || ""}
                            onChange={(e) =>
                                setForm({ ...form, notes: e.target.value })
                            }
                        />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-3 py-1 text-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-3 py-1 bg-brand-600 text-white rounded"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}

            <div className="h-[600px] relative">
                {workers.length > 0 ? (
                    <List
                        rowCount={Math.ceil(workers.length / 3)}
                        rowHeight={160}
                        style={{ height: 600, width: "100%" }}
                        rowComponent={({ index, style }: RowComponentProps) => {
                            const startIndex = index * 3;
                            const rowWorkers = workers.slice(
                                startIndex,
                                startIndex + 3,
                            );
                            return (
                                <div
                                    style={style}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
                                >
                                    {rowWorkers.map((w) => (
                                        <div
                                            key={w.id}
                                            className="bg-white shadow rounded-lg p-4 flex gap-4 items-start relative group border border-gray-100 h-[140px]"
                                        >
                                            <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                {w.image ? (
                                                    <img
                                                        src={w.image}
                                                        alt={w.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="h-full w-full p-2 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">
                                                    {w.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {w.mobile}
                                                </p>
                                                {w.email && (
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {w.email}
                                                    </p>
                                                )}
                                                {w.notes && (
                                                    <p className="text-xs text-gray-500 mt-1 italic truncate">
                                                        "{w.notes}"
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleDelete(w.id)
                                                }
                                                className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            );
                        }}
                        rowProps={{}}
                    />
                ) : (
                    <div className="py-12 text-center text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-200">
                        No workers found.
                    </div>
                )}
            </div>
        </div>
    );
};
