import React, { useState, useEffect } from "react";
import { storage } from "../../services/storage";
import {
    Purchase,
    Worker,
    WorkType,
    SavedPurchaseItem,
    WorkOrder,
} from "../../types";

import { toast } from "react-hot-toast";

interface WorkOrderAddProps {
    onCancel: () => void;
    onSuccess: () => void;
    defaultWorkTypeId?: string;
    editId?: string;
}

export const WorkOrderAdd: React.FC<WorkOrderAddProps> = ({
    onCancel,
    onSuccess,
    defaultWorkTypeId,
    editId,
}) => {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
    const [allWorkOrders, setAllWorkOrders] = useState<WorkOrder[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Selection State
    const [selWorkTypeId, setSelWorkTypeId] = useState("");
    const [selPurchaseId, setSelPurchaseId] = useState("");
    const [selParentOrderId, setSelParentOrderId] = useState("");
    const [selWorkerId, setSelWorkerId] = useState("");
    const [deadline, setDeadline] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [noOfPieces, setNoOfPieces] = useState<string>("");
    const [pricePerPc, setPricePerPc] = useState<string>("0");
    const [remarks, setRemarks] = useState<string>("");
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const [availableItems, setAvailableItems] = useState<SavedPurchaseItem[]>(
        [],
    );

    const selectedWorkType = workTypes.find((t) => t.id == selWorkTypeId);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [p, w, wt, wo] = await Promise.all([
                    storage.getPurchases(),
                    storage.getWorkers(),
                    storage.getWorkTypes(),
                    storage.getWorkOrders(),
                ]);
                setPurchases(p);
                setWorkers(w);
                setWorkTypes(wt);
                setAllWorkOrders(wo);

                if (editId) {
                    setIsEditing(true);
                    const order = await storage.getWorkOrder(editId);
                    setSelWorkTypeId(String(order.work_type_id));
                    setSelPurchaseId(
                        order.purchase_id ? String(order.purchase_id) : "",
                    );
                    setSelParentOrderId(
                        order.parent_order_id
                            ? String(order.parent_order_id)
                            : "",
                    );
                    setSelWorkerId(String(order.worker_id));
                    setDeadline(order.deadline);
                    setNoOfPieces(
                        order.no_of_pieces ? String(order.no_of_pieces) : "",
                    );
                    setPricePerPc(
                        order.price_per_pc ? String(order.price_per_pc) : "0",
                    );
                    setRemarks(order.remarks || "");
                    if (order.image_url || order.image) {
                        setImagePreview(order.image_url || order.image || null);
                    }
                    if (order.items) {
                        setSelectedItems(
                            new Set(order.items.map((i) => String(i.id))),
                        );
                    }
                } else if (defaultWorkTypeId) {
                    setSelWorkTypeId(defaultWorkTypeId);
                }
            } catch (error) {
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [editId]);

    // Reset fields when work type changes (ONLY when NOT initial editing load)
    useEffect(() => {
        if (!isEditing || loading) return;
        // setSelPurchaseId("");
        // setSelParentOrderId("");
        // setSelWorkerId("");
        // setDeadline("");
        // setNoOfPieces("");
        // setRemarks("");
        // setSelectedItems(new Set());
        // setAvailableItems([]);
    }, [selWorkTypeId]);

    // Update available items when source changes
    useEffect(() => {
        if (selectedWorkType && !selectedWorkType.parent_id) {
            if (selPurchaseId) {
                const p = purchases.find((x) => x.id == selPurchaseId);
                setAvailableItems((p ? p.items : []) as SavedPurchaseItem[]);
                // Don't clear selected items if we just loaded them for editing
                if (!isEditing) setSelectedItems(new Set());
            } else {
                setAvailableItems([]);
            }
        } else if (selectedWorkType && selectedWorkType.parent_id) {
            if (selParentOrderId) {
                const po = allWorkOrders.find((o) => o.id == selParentOrderId);
                setAvailableItems((po ? po.items : []) as SavedPurchaseItem[]);
                if (!isEditing) setSelectedItems(new Set());
            } else {
                setAvailableItems([]);
            }
        }
    }, [
        selPurchaseId,
        selParentOrderId,
        selectedWorkType,
        purchases,
        allWorkOrders,
    ]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleItem = (id: string) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedItems(newSet);
    };

    const handleSelectAll = () => {
        if (selectedItems.size === availableItems.length)
            setSelectedItems(new Set());
        else setSelectedItems(new Set(availableItems.map((i) => i.id)));
    };

    const handleSubmit = async () => {
        if (!selWorkTypeId || !selWorkerId || !deadline) {
            toast.error("Please fill Work Type, Worker, and Due Date.");
            return;
        }

        const formData = new FormData();
        formData.append("work_type_id", selWorkTypeId);
        formData.append("worker_id", selWorkerId);
        formData.append("deadline", deadline);
        if (noOfPieces) formData.append("no_of_pieces", noOfPieces);
        if (pricePerPc) formData.append("price_per_pc", pricePerPc);
        if (remarks) formData.append("remarks", remarks);
        if (image) formData.append("image", image);

        // Source: purchase or parent order (optional)
        if (selectedWorkType?.parent_id) {
            if (selParentOrderId)
                formData.append("parent_order_id", selParentOrderId);
        } else {
            if (selPurchaseId) formData.append("purchase_id", selPurchaseId);
        }

        // Items (optional)
        if (selectedItems.size > 0) {
            Array.from(selectedItems).forEach((id) =>
                formData.append("item_ids[]", id),
            );
        }

        try {
            if (editId) {
                await storage.updateWorkOrder(editId, formData);
                toast.success("Job order updated successfully!");
            } else {
                await storage.addWorkOrder(formData);
                toast.success("Job order created successfully!");
            }
            onSuccess();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to save job order",
            );
        }
    };

    // Filter work orders for parent selection
    const eligibleParentOrders = allWorkOrders.filter(
        (o) =>
            selectedWorkType &&
            o.work_type_id == selectedWorkType.parent_id &&
            o.status === "completed",
    );

    return (
        <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold mb-8 text-gray-900 border-b pb-4">
                {isEditing ? "Edit" : "Create"} Work Order
            </h3>

            {/* 1. Work Type */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                    1. Work Type
                </label>
                <select
                    className="block w-full border-gray-300 rounded-lg shadow-sm border p-3 bg-gray-50 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                    value={selWorkTypeId}
                    onChange={(e) => setSelWorkTypeId(e.target.value)}
                >
                    <option value="">Choose a work type...</option>
                    {workTypes.map((wt) => {
                        const parent = workTypes.find(
                            (t) => t.id === wt.parent_id,
                        );
                        const label = parent
                            ? `${parent.name} > ${wt.name}`
                            : wt.name;
                        return (
                            <option key={wt.id} value={wt.id}>
                                {label}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Conditional Fields based on Work Type Selection */}
            {selWorkTypeId && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 2. Purchase ID — always visible, optional */}
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                                2. Khilai ID{" "}
                                <span className="text-gray-400 font-normal normal-case">
                                    (Optional)
                                </span>
                            </label>
                            <select
                                className="block w-full border-gray-300 rounded-lg shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500"
                                value={selPurchaseId}
                                onChange={(e) =>
                                    setSelPurchaseId(e.target.value)
                                }
                            >
                                <option value="">
                                    Select Khilai (Optional)...
                                </option>
                                {purchases.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        Invoice #{p.invoice_no} ({p.date})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 2b. Parent Work Order — only for child work types */}
                        {selectedWorkType?.parent_id && (
                            <div className="col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                                    Parent Work Order{" "}
                                    <span className="text-gray-400 font-normal normal-case">
                                        (Optional)
                                    </span>
                                </label>
                                <select
                                    className="block w-full border-gray-300 rounded-lg shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500"
                                    value={selParentOrderId}
                                    onChange={(e) =>
                                        setSelParentOrderId(e.target.value)
                                    }
                                >
                                    <option value="">
                                        Select Parent Job (Optional)...
                                    </option>
                                    {eligibleParentOrders.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            Job #
                                            {String(o.id)
                                                .slice(-6)
                                                .toUpperCase()}{" "}
                                            ({o.created_at.split("T")[0]})
                                        </option>
                                    ))}
                                </select>
                                {eligibleParentOrders.length === 0 && (
                                    <p className="mt-1 text-xs text-amber-500 italic">
                                        No completed parent work orders found
                                        for this type.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* 3. Assign Worker */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                                3. Assign Worker
                            </label>
                            <select
                                className="block w-full border-gray-300 rounded-lg shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500"
                                value={selWorkerId}
                                onChange={(e) => setSelWorkerId(e.target.value)}
                            >
                                <option value="">Select Worker...</option>
                                {workers.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 4. Due Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                                4. Due Date
                            </label>
                            <input
                                type="date"
                                min={new Date().toISOString().split("T")[0]}
                                className="block w-full border-gray-300 rounded-lg shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>

                        {/* 5. No. of Pieces */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                                5. No. of Pieces
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="block w-full border-gray-300 rounded-lg shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500"
                                value={noOfPieces}
                                onChange={(e) => setNoOfPieces(e.target.value)}
                                placeholder="Enter number of pieces..."
                            />
                        </div>

                        {/* 5b. Price per Pc */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider text-brand-700">
                                5b. Rate (₹ per Pc)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="block w-full border-brand-200 rounded-lg shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500 font-bold text-brand-700"
                                value={pricePerPc}
                                onChange={(e) => setPricePerPc(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>

                        {/* 6. Image Upload */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                                6. Reference Image{" "}
                                <span className="text-gray-400 font-normal normal-case">
                                    (Optional)
                                </span>
                            </label>
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        PNG, JPG, GIF up to 5MB
                                    </p>
                                </div>
                                {imagePreview && (
                                    <div className="relative h-20 w-20 border rounded-lg overflow-hidden bg-gray-50">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            onClick={() => {
                                                setImage(null);
                                                setImagePreview(null);
                                            }}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-1 hover:bg-red-600 transition-colors"
                                        >
                                            <svg
                                                className="w-3 h-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M6 18L18 6M6 6l12 12"
                                                ></path>
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 7. Remarks */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                                7. Remarks{" "}
                                <span className="text-gray-400 font-normal normal-case">
                                    (Optional)
                                </span>
                            </label>
                            <textarea
                                className="block w-full border-gray-300 rounded-lg shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500 resize-none"
                                rows={3}
                                placeholder="Add any remarks or instructions..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Item Selection (shown only when purchase/parent is selected) */}
                    {(selPurchaseId || selParentOrderId) &&
                        availableItems.length > 0 && (
                            <div className="border rounded-xl p-6 bg-gray-50 shadow-inner">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                                        8. Select Items to Assign{" "}
                                        <span className="text-gray-400 font-normal normal-case">
                                            (Optional)
                                        </span>
                                    </label>
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-xs text-brand-700 font-bold hover:bg-brand-100 px-3 py-1 rounded-full transition-colors"
                                    >
                                        {selectedItems.size ===
                                        availableItems.length
                                            ? "Deselect All"
                                            : "Select All"}
                                    </button>
                                </div>
                                <div className="max-h-72 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                                    {availableItems.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleItem(item.id)}
                                            className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all duration-200 shadow-sm ${
                                                selectedItems.has(item.id)
                                                    ? "bg-brand-600 border-brand-600 text-white transform scale-105"
                                                    : "bg-white border-gray-200 hover:border-brand-300 text-gray-700 hover:shadow-md"
                                            }`}
                                        >
                                            <div className="font-black text-base">
                                                Sr. {item.s_no}
                                            </div>
                                            <div
                                                className={`text-xs mt-1 ${selectedItems.has(item.id) ? "text-brand-50" : "text-gray-500"}`}
                                            >
                                                {item.size_meters}m |{" "}
                                                {item.pieces_round} pcs
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 text-right text-xs font-medium text-gray-400 uppercase tracking-tighter">
                                    {selectedItems.size} of{" "}
                                    {availableItems.length} items chosen
                                </div>
                            </div>
                        )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={
                                !selWorkTypeId || !selWorkerId || !deadline
                            }
                            className="px-8 py-2.5 bg-brand-600 text-white rounded-lg font-bold shadow-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
                        >
                            {isEditing ? "Update" : "Create"} Job Order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
