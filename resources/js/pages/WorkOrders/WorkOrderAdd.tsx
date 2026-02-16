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
}

export const WorkOrderAdd: React.FC<WorkOrderAddProps> = ({
    onCancel,
    onSuccess,
}) => {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
    const [allWorkOrders, setAllWorkOrders] = useState<WorkOrder[]>([]);

    // Selection State
    const [selWorkTypeId, setSelWorkTypeId] = useState("");
    const [selPurchaseId, setSelPurchaseId] = useState("");
    const [selParentOrderId, setSelParentOrderId] = useState("");
    const [selWorkerId, setSelWorkerId] = useState("");
    const [deadline, setDeadline] = useState("");
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const [availableItems, setAvailableItems] = useState<SavedPurchaseItem[]>(
        [],
    );

    const selectedWorkType = workTypes.find((t) => t.id == selWorkTypeId);

    useEffect(() => {
        const fetchData = async () => {
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
        };
        fetchData();
    }, []);

    // Reset fields when work type changes
    useEffect(() => {
        setSelPurchaseId("");
        setSelParentOrderId("");
        setSelWorkerId("");
        setDeadline("");
        setSelectedItems(new Set());
        setAvailableItems([]);
    }, [selWorkTypeId]);

    // Update items when source changes
    useEffect(() => {
        if (selectedWorkType && !selectedWorkType.parent_id) {
            if (selPurchaseId) {
                const p = purchases.find((x) => x.id == selPurchaseId);
                setAvailableItems((p ? p.items : []) as SavedPurchaseItem[]);
                setSelectedItems(new Set());
            } else {
                setAvailableItems([]);
            }
        } else if (selectedWorkType && selectedWorkType.parent_id) {
            if (selParentOrderId) {
                const po = allWorkOrders.find((o) => o.id == selParentOrderId);
                setAvailableItems((po ? po.items : []) as SavedPurchaseItem[]);
                setSelectedItems(new Set());
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
        if (
            !selWorkTypeId ||
            (!selPurchaseId && !selParentOrderId) ||
            !selWorkerId ||
            !deadline ||
            selectedItems.size === 0
        ) {
            toast.error("Please fill all fields and select at least one item.");
            return;
        }

        const wo: any = {
            work_type_id: selWorkTypeId,
            worker_id: selWorkerId,
            deadline,
            item_ids: Array.from(selectedItems),
        };

        if (selectedWorkType?.parent_id) {
            wo.parent_order_id = selParentOrderId;
        } else {
            wo.purchase_id = selPurchaseId;
        }

        try {
            await storage.addWorkOrder(wo);
            toast.success("Job order created successfully!");
            onSuccess();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to create job order",
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
                Create Work Order
            </h3>

            {/* Always show Work Type first */}
            <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                    1. Select Work Type
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
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Source Selection */}
                        <div className="col-span-1">
                            {selectedWorkType && !selectedWorkType.parent_id ? (
                                <>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                                        2. Source Purchase
                                    </label>
                                    <select
                                        className="block w-full border-gray-300 rounded-lg shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500"
                                        value={selPurchaseId}
                                        onChange={(e) =>
                                            setSelPurchaseId(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Select Purchase...
                                        </option>
                                        {purchases.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                Invoice #{p.invoice_no} (
                                                {p.date})
                                            </option>
                                        ))}
                                    </select>
                                </>
                            ) : (
                                <>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                                        2. Parent Work Order
                                    </label>
                                    <select
                                        className="block w-full border-gray-300 rounded-lg shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500"
                                        value={selParentOrderId}
                                        onChange={(e) =>
                                            setSelParentOrderId(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Select Parent Job...
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
                                        <p className="mt-1 text-xs text-red-500 italic">
                                            No active parent work orders found
                                            for this type.
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Worker Selection */}
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

                        {/* Deadline */}
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
                    </div>

                    {/* Item Selection */}
                    {(selPurchaseId || selParentOrderId) && (
                        <div className="border rounded-xl p-6 bg-gray-50 shadow-inner">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                                    5. Select Items to Assign
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
                                {selectedItems.size} of {availableItems.length}{" "}
                                items chosen
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
                                !selWorkerId ||
                                !deadline ||
                                selectedItems.size === 0
                            }
                            className="px-8 py-2.5 bg-brand-600 text-white rounded-lg font-bold shadow-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
                        >
                            Create Job Order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
