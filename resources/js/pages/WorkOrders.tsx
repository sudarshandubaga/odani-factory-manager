import React, { useState, useEffect } from "react";
import { storage } from "../services/storage";
import {
    WorkOrder,
    Purchase,
    Worker,
    WorkType,
    PurchaseItem,
    SavedPurchaseItem,
} from "../types";
import { Link } from "react-router-dom";
import { Plus, Printer } from "lucide-react";
import { List, RowComponentProps } from "react-window";

export const WorkOrders: React.FC = () => {
    const [view, setView] = useState<"list" | "create">("list");
    const [orders, setOrders] = useState<WorkOrder[]>([]);
    const [filter, setFilter] = useState<
        "pending" | "completed" | "overdue" | "all"
    >("all");

    const today = new Date().toISOString().split("T")[0];

    const filteredOrders = orders.filter((order) => {
        if (filter === "all") return true;
        if (filter === "pending") return order.status === "active";
        if (filter === "completed") return order.status === "completed";
        if (filter === "overdue")
            return order.status === "active" && order.deadline < today;
        return true;
    });

    useEffect(() => {
        const fetchOrders = async () => {
            const data = await storage.getWorkOrders();
            setOrders(data);
        };
        fetchOrders();
    }, [view]);

    const toggleStatus = async (
        id: string | number,
        current: "active" | "completed",
    ) => {
        const newStatus = current === "active" ? "completed" : "active";
        await storage.updateWorkOrderStatus(id, newStatus);
        setOrders(
            orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)),
        );
    };

    const [workers, setWorkers] = useState<Worker[]>([]);
    const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const [w, wt, p] = await Promise.all([
                storage.getWorkers(),
                storage.getWorkTypes(),
                storage.getPurchases(),
            ]);
            setWorkers(w);
            setWorkTypes(wt);
            setPurchases(p);
        };
        fetchData();
    }, []);

    if (view === "create") {
        return (
            <CreateWorkOrder
                onCancel={() => setView("list")}
                onSuccess={() => setView("list")}
            />
        );
    }

    const getWorkerName = (id: any) =>
        workers.find((w) => w.id == id)?.name || "Unknown";
    const getWorkName = (id: any) =>
        workTypes.find((w) => w.id == id)?.name || "Unknown";
    const getPurchaseInfo = (id: any) => {
        const p = purchases.find((x) => x.id == id);
        return p ? `Inv #${p.invoice_no}` : "Unknown";
    };

    const Row = ({ index, style, ...props }: RowComponentProps) => {
        const order = filteredOrders[index];
        if (!order) return null;

        return (
            <div
                style={style}
                {...props}
                className="p-4 border-b border-gray-200 hover:bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white"
            >
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-gray-900">
                            {getWorkName(order.work_type_id)}
                        </span>
                        <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === "active" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
                        >
                            {order.status.toUpperCase()}
                        </span>
                        {order.status === "active" &&
                            order.deadline < today && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    OVERDUE
                                </span>
                            )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        Worker:{" "}
                        <span className="font-medium text-gray-700">
                            {getWorkerName(order.worker_id)}
                        </span>{" "}
                        | Source: {getPurchaseInfo(order.purchase_id)} | Items:{" "}
                        {order.items?.length || 0}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        Deadline: {order.deadline}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => toggleStatus(order.id, order.status)}
                        className={`text-sm px-3 py-1 border rounded ${order.status === "active" ? "text-green-600 border-green-200 hover:bg-green-50" : "text-gray-500 border-gray-200"}`}
                    >
                        {order.status === "active"
                            ? "Mark Complete"
                            : "Mark Active"}
                    </button>
                    <button
                        onClick={() => {
                            const url = `#/work-orders/${order.id}/print`;
                            window.open(
                                url,
                                "PrintWindow",
                                "width=900,height=800,scrollbars=yes",
                            );
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Print Work Order"
                    >
                        <Printer className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Work Orders
                </h2>
                <button
                    onClick={() => setView("create")}
                    className="btn-primary flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700"
                >
                    <Plus className="w-4 h-4" /> Create Work Order
                </button>
            </div>

            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
                {(["all", "pending", "completed", "overdue"] as const).map(
                    (f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                filter === f
                                    ? f === "overdue"
                                        ? "bg-red-600 text-white shadow-sm"
                                        : "bg-white text-brand-700 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            <span className="ml-2 opacity-60 text-xs">
                                (
                                {
                                    orders.filter((o) => {
                                        if (f === "all") return true;
                                        if (f === "pending")
                                            return o.status === "active";
                                        if (f === "completed")
                                            return o.status === "completed";
                                        if (f === "overdue")
                                            return (
                                                o.status === "active" &&
                                                o.deadline < today
                                            );
                                        return true;
                                    }).length
                                }
                                )
                            </span>
                        </button>
                    ),
                )}
            </div>

            <div className="bg-white shadow overflow-hidden rounded-md h-[600px] relative">
                {filteredOrders.length > 0 ? (
                    <List
                        rowCount={filteredOrders.length}
                        rowHeight={100}
                        style={{ height: 600, width: "100%" }}
                        rowComponent={Row}
                        rowProps={{}}
                    />
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        <div className="mb-4">
                            <Plus className="w-12 h-12 mx-auto text-gray-300" />
                        </div>
                        <p className="text-lg font-medium text-gray-900">
                            No {filter === "all" ? "" : filter} work orders
                            found
                        </p>
                        <p className="mt-1">
                            {filter === "all"
                                ? "Start by creating your first work order."
                                : "Try changing the filter to see more orders."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Extracted Row component to use filteredOrders
const Row = ({ index, style, data }: any) => {
    // Note: In react-window, the Row component usually receives data via itemData prop,
    // but here we can just access the filtered list if we pass it or use a closure.
    // For simplicity, I'll keep it as a sub-component within WorkOrders or pass the order.
    return null; // This will be replaced below in the full rewrite of the Row component logic
};

const CreateWorkOrder: React.FC<{
    onCancel: () => void;
    onSuccess: () => void;
}> = ({ onCancel, onSuccess }) => {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [workTypes, setWorkTypes] = useState<WorkType[]>([]);

    // Selection State
    const [selPurchaseId, setSelPurchaseId] = useState("");
    const [selWorkerId, setSelWorkerId] = useState("");
    const [selWorkTypeId, setSelWorkTypeId] = useState("");
    const [deadline, setDeadline] = useState("");
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // Filtered Items (Only items from selected purchase not already in active work orders?)
    // For simplicity, we just list items from the selected purchase. In a real app, we'd filter out "in-process" items.
    const [availableItems, setAvailableItems] = useState<SavedPurchaseItem[]>(
        [],
    );

    useEffect(() => {
        const fetchData = async () => {
            const [p, w, wt] = await Promise.all([
                storage.getPurchases(),
                storage.getWorkers(),
                storage.getWorkTypes(),
            ]);
            setPurchases(p);
            setWorkers(w);
            setWorkTypes(wt);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selPurchaseId) {
            const p = purchases.find((x) => x.id == selPurchaseId);
            setAvailableItems((p ? p.items : []) as SavedPurchaseItem[]);
            setSelectedItems(new Set());
        } else {
            setAvailableItems([]);
        }
    }, [selPurchaseId, purchases]);

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
            !selPurchaseId ||
            !selWorkerId ||
            !selWorkTypeId ||
            !deadline ||
            selectedItems.size === 0
        ) {
            alert("Please fill all fields and select at least one item.");
            return;
        }
        const wo = {
            purchase_id: selPurchaseId,
            worker_id: selWorkerId,
            work_type_id: selWorkTypeId,
            deadline,
            item_ids: Array.from(selectedItems),
        };
        await storage.addWorkOrder(wo);
        onSuccess();
    };

    return (
        <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold mb-6 text-gray-900">
                Create Work Order
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Select Purchase (Source)
                    </label>
                    <select
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                        value={selPurchaseId}
                        onChange={(e) => setSelPurchaseId(e.target.value)}
                    >
                        <option value="">Select Purchase...</option>
                        {purchases.map((p) => (
                            <option key={p.id} value={p.id}>
                                Invoice #{p.invoice_no} ({p.date})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Select Worker
                    </label>
                    <select
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
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
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Work Type
                    </label>
                    <select
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                        value={selWorkTypeId}
                        onChange={(e) => setSelWorkTypeId(e.target.value)}
                    >
                        <option value="">Select Work...</option>
                        {workTypes.map((wt) => (
                            <option key={wt.id} value={wt.id}>
                                {wt.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Deadline
                    </label>
                    <input
                        type="date"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                </div>
            </div>

            {selPurchaseId && (
                <div className="mb-6 border rounded-md p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-medium text-sm">
                            Select Items to Assign
                        </label>
                        <button
                            onClick={handleSelectAll}
                            className="text-xs text-brand-600 font-bold hover:underline"
                        >
                            {selectedItems.size === availableItems.length
                                ? "Deselect All"
                                : "Select All"}
                        </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {availableItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggleItem(item.id)}
                                className={`cursor-pointer border rounded p-2 text-center text-sm transition-colors ${selectedItems.has(item.id) ? "bg-brand-100 border-brand-500 text-brand-700" : "bg-white hover:bg-gray-100"}`}
                            >
                                <div className="font-bold">Sr. {item.s_no}</div>
                                <div className="text-xs">
                                    {item.size_meters}m / {item.pieces_round}{" "}
                                    pcs
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 text-right text-sm text-gray-500">
                        {selectedItems.size} items selected
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-4">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
                >
                    Create Work Order
                </button>
            </div>
        </div>
    );
};
