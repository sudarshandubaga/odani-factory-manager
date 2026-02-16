import React, { useState, useEffect } from "react";
import { storage } from "../../services/storage";
import { Supplier } from "../../types";
import { Plus, Trash, Building2, Phone, Mail, MapPin } from "lucide-react";
import { NewSupplierModal } from "../../components/NewSupplierModal";
import { List, RowComponentProps } from "react-window";

import { toast } from "react-hot-toast";

export const SuppliersManager: React.FC = () => {
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
        try {
            const newSup = await storage.addSupplier(supplierData);
            setSuppliers([...suppliers, newSup]);
            setIsAdding(false);
            toast.success("Supplier added successfully!");
        } catch (error) {
            toast.error("Failed to add supplier");
        }
    };

    const handleDelete = async (id: string | number) => {
        if (window.confirm("Are you sure you want to delete this supplier?")) {
            try {
                await storage.deleteSupplier(id);
                setSuppliers(suppliers.filter((s) => s.id !== id));
                toast.success("Supplier deleted successfully");
            } catch (error) {
                toast.error("Failed to delete supplier");
            }
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
