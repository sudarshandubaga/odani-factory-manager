import React, { useState, useEffect } from "react";
import { storage } from "../services/storage";
import { Worker, WorkType, Supplier } from "../types";
import {
    Plus,
    Trash,
    User,
    Tag,
    Truck,
    Mail,
    Phone,
    MapPin,
    Building2,
} from "lucide-react";
import { NewSupplierModal } from "../components/NewSupplierModal";
import { List, RowComponentProps } from "react-window";

export const MasterData: React.FC = () => {
    const [activeTab, setActiveTab] = useState<
        "workers" | "workTypes" | "suppliers"
    >("workers");

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab("workers")}
                        className={`${activeTab === "workers" ? "border-brand-500 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <User className="w-4 h-4 mr-2" /> Workers
                    </button>
                    <button
                        onClick={() => setActiveTab("workTypes")}
                        className={`${activeTab === "workTypes" ? "border-brand-500 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <Tag className="w-4 h-4 mr-2" /> Work Types
                    </button>
                    <button
                        onClick={() => setActiveTab("suppliers")}
                        className={`${activeTab === "suppliers" ? "border-brand-500 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <Truck className="w-4 h-4 mr-2" /> Suppliers
                    </button>
                </nav>
            </div>

            {activeTab === "workers" && <WorkersManager />}
            {activeTab === "workTypes" && <WorkTypesManager />}
            {activeTab === "suppliers" && <SuppliersManager />}
        </div>
    );
};

const WorkersManager: React.FC = () => {
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
        if (!form.name || !form.mobile)
            return alert("Name and Mobile are required");
        const newWorker = await storage.addWorker(form);
        setWorkers([...workers, newWorker]);
        setIsAdding(false);
        setForm({});
    };

    const handleDelete = async (id: string | number) => {
        if (window.confirm("Delete worker?")) {
            await storage.deleteWorker(id);
            setWorkers(workers.filter((w) => w.id !== id));
        }
    };

    // Handle simple image simulation
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

const WorkTypesManager: React.FC = () => {
    const [types, setTypes] = useState<WorkType[]>([]);
    const [name, setName] = useState("");

    useEffect(() => {
        const fetchTypes = async () => {
            const data = await storage.getWorkTypes();
            setTypes(data);
        };
        fetchTypes();
    }, []);

    const handleAdd = async () => {
        if (!name) return;
        const newType = await storage.addWorkType({ name });
        setTypes([...types, newType]);
        setName("");
    };

    const handleDelete = async (id: string | number) => {
        await storage.deleteWorkType(id);
        setTypes(types.filter((t) => t.id !== id));
    };

    return (
        <div className="max-w-xl">
            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Work Name (e.g. Dyeing)"
                    className="flex-1 border p-2 rounded"
                />
                <button
                    onClick={handleAdd}
                    className="bg-brand-600 text-white px-4 py-2 rounded"
                >
                    Add Work
                </button>
            </div>
            <div className="bg-white shadow rounded-md divide-y h-[400px] relative">
                {types.length > 0 ? (
                    <List
                        rowCount={types.length}
                        rowHeight={60}
                        style={{ height: 400, width: "100%" }}
                        rowComponent={({ index, style }: RowComponentProps) => {
                            const t = types[index];
                            if (!t) return null;
                            return (
                                <div
                                    style={style}
                                    className="p-4 flex justify-between items-center bg-white border-b"
                                >
                                    <span>{t.name}</span>
                                    <button
                                        onClick={() => handleDelete(t.id)}
                                        className="text-red-500"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        }}
                        rowProps={{}}
                    />
                ) : (
                    <div className="p-4 text-center text-gray-500">
                        No work types found.
                    </div>
                )}
            </div>
        </div>
    );
};

const SuppliersManager: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const fetchSuppliers = async () => {
            const data = await storage.getSuppliers();
            setSuppliers(data);
        };
        fetchSuppliers();
    }, []);

    const handleSave = async (supplierData: Omit<Supplier, "id">) => {
        const newSup = await storage.addSupplier(supplierData);
        setSuppliers([...suppliers, newSup]);
        setIsAdding(false);
    };

    const handleDelete = async (id: string | number) => {
        if (window.confirm("Delete supplier?")) {
            await storage.deleteSupplier(id);
            setSuppliers(suppliers.filter((s) => s.id !== id));
        }
    };

    return (
        <div>
            <NewSupplierModal
                isOpen={isAdding}
                onClose={() => setIsAdding(false)}
                onSave={handleSave}
            />

            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsAdding(true)}
                    className="btn-primary bg-brand-600 text-white px-3 py-2 rounded flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Supplier
                </button>
            </div>

            <div className="h-[600px] relative">
                {suppliers.length > 0 ? (
                    <List
                        rowCount={Math.ceil(suppliers.length / 3)}
                        rowHeight={180}
                        style={{ height: 600, width: "100%" }}
                        rowComponent={({ index, style }: RowComponentProps) => {
                            const startIndex = index * 3;
                            const rowSuppliers = suppliers.slice(
                                startIndex,
                                startIndex + 3,
                            );
                            return (
                                <div
                                    style={style}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
                                >
                                    {rowSuppliers.map((s) => (
                                        <div
                                            key={s.id}
                                            className="bg-white shadow rounded-lg p-5 relative group border border-gray-100 hover:border-brand-200 transition-all h-[160px] overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold text-gray-900 text-lg truncate">
                                                        {s.name}
                                                    </h4>
                                                    {s.shopName && (
                                                        <div className="flex items-center text-sm text-brand-600 mt-0.5 truncate">
                                                            <Building2 className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                                                            <span className="truncate">
                                                                {s.shopName}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(s.id)
                                                    }
                                                    className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity ml-2"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="space-y-1">
                                                {s.mobile && (
                                                    <div className="flex items-center text-sm text-gray-600 truncate">
                                                        <Phone className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {s.mobile}
                                                        </span>
                                                    </div>
                                                )}
                                                {s.email && (
                                                    <div className="flex items-center text-sm text-gray-600 truncate">
                                                        <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {s.email}
                                                        </span>
                                                    </div>
                                                )}
                                                {(s.address ||
                                                    s.city ||
                                                    s.state ||
                                                    s.pincode) && (
                                                    <div className="flex items-start text-sm text-gray-600 truncate">
                                                        <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {s.address}
                                                            {s.address &&
                                                                (s.city ||
                                                                    s.state) &&
                                                                ", "}
                                                            {s.city}
                                                            {s.city &&
                                                                s.state &&
                                                                ", "}
                                                            {s.state}
                                                            {s.pincode &&
                                                                ` - ${s.pincode}`}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        }}
                        rowProps={{}}
                    />
                ) : (
                    <div className="py-12 text-center text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-200">
                        No suppliers found. Click "Add Supplier" to get started.
                    </div>
                )}
            </div>
        </div>
    );
};
