import React, { useState, useEffect } from "react";
import { storage } from "../../services/storage";
import { WorkType } from "../../types";
import { Trash } from "lucide-react";
import { List, RowComponentProps } from "react-window";

import { toast } from "react-hot-toast";

export const WorkTypesManager: React.FC = () => {
    const [types, setTypes] = useState<WorkType[]>([]);
    const [name, setName] = useState("");
    const [parentId, setParentId] = useState<string>("");

    useEffect(() => {
        const fetchTypes = async () => {
            const data = await storage.getWorkTypes();
            setTypes(data);
        };
        fetchTypes();
    }, []);

    const handleAdd = async () => {
        if (!name) {
            toast.error("Work type name is required");
            return;
        }
        try {
            const newType = await storage.addWorkType({
                name,
                parent_id: parentId || null,
            });
            // Correctly update local state with the new type
            setTypes([...types, newType]);
            setName("");
            setParentId("");
            toast.success("Work type added successfully!");
        } catch (error) {
            toast.error("Failed to add work type");
        }
    };

    const handleDelete = async (id: string | number) => {
        if (window.confirm("Are you sure you want to delete this work type?")) {
            try {
                await storage.deleteWorkType(id);
                setTypes(types.filter((t) => t.id !== id));
                toast.success("Work type deleted");
            } catch (error) {
                toast.error("Failed to delete work type");
            }
        }
    };

    const getParentName = (pid: string | null | undefined) => {
        if (!pid) return null;
        return types.find((t) => t.id == pid)?.name || "Unknown";
    };

    return (
        <div className="max-w-2xl">
            <div className="bg-white p-6 shadow rounded-lg mb-6 border border-brand-100">
                <h3 className="text-lg font-medium mb-4">New Work Type</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Work Name (e.g. Dyeing)"
                            className="w-full border p-2 rounded focus:ring-brand-500 focus:border-brand-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Parent Work Type (Optional)
                        </label>
                        <select
                            value={parentId}
                            onChange={(e) => setParentId(e.target.value)}
                            className="w-full border p-2 rounded focus:ring-brand-500 focus:border-brand-500"
                        >
                            <option value="">None (Top Level)</option>
                            {types.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleAdd}
                            className="bg-brand-600 text-white px-6 py-2 rounded hover:bg-brand-700 transition-colors w-full sm:w-auto"
                        >
                            Add Work
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-md divide-y h-[400px] relative overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-50 border-b p-3 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
                    <div className="col-span-6">Work Type Name</div>
                    <div className="col-span-4">Parent</div>
                    <div className="col-span-2 text-right">Action</div>
                </div>
                {types.length > 0 ? (
                    <List
                        rowCount={types.length}
                        rowHeight={50}
                        style={{ height: 350, width: "100%" }}
                        rowComponent={({ index, style }: RowComponentProps) => {
                            const t = types[index];
                            if (!t) return null;
                            const pName = getParentName(t.parent_id);
                            return (
                                <div
                                    style={style}
                                    className="px-3 grid grid-cols-12 items-center bg-white border-b hover:bg-gray-50 text-sm"
                                >
                                    <div className="col-span-6 font-medium text-gray-900">
                                        {t.name}
                                    </div>
                                    <div className="col-span-4 text-gray-500">
                                        {pName ? (
                                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                                {pName}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300 italic text-xs">
                                                -
                                            </span>
                                        )}
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            className="text-red-400 hover:text-red-600 p-1"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        }}
                        rowProps={{}}
                    />
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No work types found. Add your first work type above.
                    </div>
                )}
            </div>
        </div>
    );
};
