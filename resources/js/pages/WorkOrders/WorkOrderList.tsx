import React, { useState, useEffect } from "react";
import { storage } from "../../services/storage";
import { WorkOrder, Worker, WorkType, Purchase } from "../../types";
import { Plus, Printer } from "lucide-react";
import { List, RowComponentProps } from "react-window";

import { toast } from "react-hot-toast";

interface WorkOrderListProps {
    onCreateClick: () => void;
}

export const WorkOrderList: React.FC<WorkOrderListProps> = ({
    onCreateClick,
}) => {
    const [orders, setOrders] = useState<WorkOrder[]>([]);
    const [filter, setFilter] = useState<
        "pending" | "completed" | "overdue" | "all"
    >("all");
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    const today = new Date().toISOString().split("T")[0];

    const fetchData = async () => {
        const [o, w, wt, p] = await Promise.all([
            storage.getWorkOrders(),
            storage.getWorkers(),
            storage.getWorkTypes(),
            storage.getPurchases(),
        ]);
        setOrders(o);
        setWorkers(w);
        setWorkTypes(wt);
        setPurchases(p);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleStatus = async (
        id: string | number,
        current: "active" | "completed",
    ) => {
        const order = orders.find((o) => o.id === id);
        if (order && (order.childOrders?.length ?? 0) > 0) {
            toast.error(
                "Cannot change status: This job has child assignments. You must delete or update child jobs first.",
            );
            return;
        }

        const newStatus = current === "active" ? "completed" : "active";
        try {
            await storage.updateWorkOrderStatus(id, newStatus);
            toast.success(`Job marked as ${newStatus}`);
            setOrders(
                orders.map((o) =>
                    o.id === id ? { ...o, status: newStatus } : o,
                ),
            );
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to update status",
            );
        }
    };

    const filteredOrders = orders.filter((order) => {
        if (filter === "all") return true;
        if (filter === "pending") return order.status === "active";
        if (filter === "completed") return order.status === "completed";
        if (filter === "overdue")
            return order.status === "active" && order.deadline < today;
        return true;
    });

    const getWorkerName = (id: any) =>
        workers.find((w) => w.id == id)?.name || "Unknown";
    const getWorkName = (id: any) => {
        const wt = workTypes.find((w) => w.id == id);
        if (!wt) return "Unknown";
        const parent = workTypes.find((t) => t.id === wt.parent_id);
        return parent ? `${parent.name} > ${wt.name}` : wt.name;
    };
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
                <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                        {order.image_url || order.image ? (
                            <img
                                src={order.image_url || order.image || ""}
                                alt="Job"
                                className="w-16 h-16 object-cover rounded-md border border-gray-200"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gray-50 border border-dashed border-gray-200 rounded-md flex items-center justify-center text-gray-300">
                                <Plus className="w-6 h-6" />
                            </div>
                        )}
                    </div>
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
                            | Source: {getPurchaseInfo(order.purchase_id)} |
                            Items: {order.items?.length || 0}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            Deadline: {order.deadline}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => toggleStatus(order.id, order.status)}
                        disabled={(order.childOrders?.length ?? 0) > 0}
                        title={
                            (order.childOrders?.length ?? 0) > 0
                                ? "Cannot change status: This job has child assignments"
                                : ""
                        }
                        className={`text-sm px-3 py-1 border rounded transition-opacity ${
                            (order.childOrders?.length ?? 0) > 0
                                ? "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200"
                                : order.status === "active"
                                  ? "text-green-600 border-green-200 hover:bg-green-50"
                                  : "text-gray-500 border-gray-200 hover:bg-gray-50"
                        }`}
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
                    onClick={onCreateClick}
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
