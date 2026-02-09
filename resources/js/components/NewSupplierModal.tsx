import React, { useState } from "react";
import { X } from "lucide-react";
import { Supplier } from "../types";

interface NewSupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplierData: Omit<Supplier, "id">) => void;
}

export const NewSupplierModal: React.FC<NewSupplierModalProps> = ({
    isOpen,
    onClose,
    onSave,
}) => {
    const [formData, setFormData] = useState<Omit<Supplier, "id">>({
        name: "",
        mobile: "",
        email: "",
        shopName: "",
        address: "",
        state: "",
        city: "",
        pincode: "",
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name.trim()) {
            onSave({
                ...formData,
                name: formData.name.trim(),
            });
            setFormData({
                name: "",
                mobile: "",
                email: "",
                shopName: "",
                address: "",
                state: "",
                city: "",
                pincode: "",
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Add New Supplier
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                autoFocus
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                placeholder="Enter supplier name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="mobile"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Mobile No
                            </label>
                            <input
                                type="tel"
                                name="mobile"
                                id="mobile"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                placeholder="e.g. 9876543210"
                                value={formData.mobile}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label
                                htmlFor="shopName"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Shop / Company Name
                            </label>
                            <input
                                type="text"
                                name="shopName"
                                id="shopName"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                placeholder="e.g. ABC Textiles"
                                value={formData.shopName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label
                                htmlFor="address"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                id="address"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                placeholder="Street Address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="city"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                City
                            </label>
                            <input
                                type="text"
                                name="city"
                                id="city"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="state"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                State
                            </label>
                            <input
                                type="text"
                                name="state"
                                id="state"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                placeholder="State"
                                value={formData.state}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="pincode"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Pincode
                            </label>
                            <input
                                type="text"
                                name="pincode"
                                id="pincode"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                placeholder="Pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                        >
                            Add Supplier
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
