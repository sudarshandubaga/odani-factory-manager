import React, { useState, useEffect } from "react";
import { storage } from "../../services/storage";
import { WorkOrder, Worker, WorkType, Purchase } from "../../types";
import { Plus, Printer } from "lucide-react";
import { List, RowComponentProps } from "react-window";

import { toast } from "react-hot-toast";

interface WorkOrderListProps {
    onCreateClick: () => void;
    workTypeId?: string;
}

export const WorkOrderList: React.FC<WorkOrderListProps> = ({
    onCreateClick,
    workTypeId,
}) => {
    const [orders, setOrders] = useState<WorkOrder[]>([]);
    const [filter, setFilter] = useState<
        "pending" | "completed" | "overdue" | "all"
    >("all");
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
    const [receivedPcs, setReceivedPcs] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

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

    // Reset status filter when work type changes
    useEffect(() => {
        setFilter("all");
    }, [workTypeId]);

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

        if (current === "active") {
            // Opening modal for completion
            setSelectedOrder(order || null);
            // Default received to no_of_pieces if set, else sum of item pieces
            const defaultPcs =
                order?.no_of_pieces ||
                order?.items?.reduce((s, i) => s + (i.pieces_round || 0), 0) ||
                "";
            setReceivedPcs(String(defaultPcs));
            setNotes("");
            setIsCompletionModalOpen(true);
        } else {
            // Re-activating
            const newStatus = "active";
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
        }
    };

    const handleMarkReceived = async () => {
        if (!selectedOrder) return;
        setSubmitting(true);
        const received = parseInt(receivedPcs) || 0;
        const assigned = selectedOrder.no_of_pieces || 0;
        const due = assigned > 0 ? Math.max(0, assigned - received) : 0;
        try {
            const data = {
                received_pcs: received,
                due_pcs: due,
                notes: notes,
            };
            await storage.updateWorkOrderStatus(
                selectedOrder.id,
                "completed",
                data,
            );
            toast.success("Job marked as received and completed");
            setOrders(
                orders.map((o) =>
                    o.id === selectedOrder.id
                        ? { ...o, status: "completed", ...data }
                        : o,
                ),
            );
            setIsCompletionModalOpen(false);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to complete job",
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Resolve all type IDs that belong to the selected root work type (root + its children)
    const typeFilterIds = React.useMemo(() => {
        if (!workTypeId) return null;
        const ids = new Set<string>();
        ids.add(String(workTypeId));
        workTypes.forEach((wt) => {
            if (String(wt.parent_id) === String(workTypeId))
                ids.add(String(wt.id));
        });
        return ids;
    }, [workTypeId, workTypes]);

    const activeWorkTypeName = workTypeId
        ? workTypes.find((wt) => String(wt.id) === String(workTypeId))?.name
        : undefined;

    const typeFilteredOrders = typeFilterIds
        ? orders.filter((o) => typeFilterIds.has(String(o.work_type_id)))
        : orders;

    const filteredOrders = typeFilteredOrders.filter((order) => {
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
                            | Khilai: {getPurchaseInfo(order.purchase_id)} |
                            Items: {order.items?.length || 0}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex gap-3">
                            <span>Deadline: {order.deadline}</span>
                            {order.no_of_pieces && (
                                <span className="text-blue-600 font-medium">
                                    Pieces: {order.no_of_pieces}
                                </span>
                            )}
                            {order.status === "completed" && (
                                <span className="text-green-600 font-medium">
                                    Completed: {order.received_pcs} pcs
                                    {(order.due_pcs ?? 0) > 0 && (
                                        <span className="text-red-500 ml-1">
                                            | Due: {order.due_pcs} pcs
                                        </span>
                                    )}
                                    {order.notes && ` (${order.notes})`}
                                </span>
                            )}
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
                    {activeWorkTypeName ?? "Work Orders"}
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
                                    typeFilteredOrders.filter((o) => {
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

            {/* Completion Modal */}
            {isCompletionModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            Mark Work Order as Received
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Enter the details of the items received from the
                            worker.
                        </p>

                        {/* Summary bar */}
                        {selectedOrder.no_of_pieces && (
                            <div className="flex gap-3 mb-6">
                                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                                    <div className="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-1">
                                        Assigned Pieces
                                    </div>
                                    <div className="text-2xl font-black text-blue-700">
                                        {selectedOrder.no_of_pieces}
                                    </div>
                                </div>
                                <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                    <div className="text-xs text-green-500 font-semibold uppercase tracking-wider mb-1">
                                        Completed
                                    </div>
                                    <div className="text-2xl font-black text-green-700">
                                        {receivedPcs || 0}
                                    </div>
                                </div>
                                <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                                    <div className="text-xs text-red-500 font-semibold uppercase tracking-wider mb-1">
                                        Due Pieces
                                    </div>
                                    <div className="text-2xl font-black text-red-700">
                                        {Math.max(
                                            0,
                                            (selectedOrder.no_of_pieces || 0) -
                                                (parseInt(receivedPcs) || 0),
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Completed Pieces Received
                                </label>
                                <input
                                    type="number"
                                    className="block w-full border-gray-300 rounded-lg shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500"
                                    placeholder="Enter quantity..."
                                    value={receivedPcs}
                                    onChange={(e) =>
                                        setReceivedPcs(e.target.value)
                                    }
                                />
                                {selectedOrder.no_of_pieces &&
                                    parseInt(receivedPcs) > 0 && (
                                        <p className="mt-1 text-xs text-red-500 font-medium">
                                            Due pieces:{" "}
                                            {Math.max(
                                                0,
                                                (selectedOrder.no_of_pieces ||
                                                    0) -
                                                    (parseInt(receivedPcs) ||
                                                        0),
                                            )}{" "}
                                            will be recorded.
                                        </p>
                                    )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Notes (for remaining pcs or issues)
                                </label>
                                <textarea
                                    className="block w-full border-gray-300 rounded-lg shadow-sm border p-3 focus:ring-brand-500 focus:border-brand-500"
                                    rows={3}
                                    placeholder="Add any notes here..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsCompletionModalOpen(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkReceived}
                                disabled={submitting || !receivedPcs}
                                className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg shadow-lg hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {submitting ? "Processing..." : "Mark Received"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
