import React, { useState, useEffect } from "react";
import { storage } from "../../services/storage";
import { WorkOrder, Worker, WorkType, Purchase } from "../../types";
import {
    Plus,
    Printer,
    CreditCard,
    Edit,
    Trash2,
    RotateCcw,
    Trash,
    CheckSquare,
    Square,
} from "lucide-react";
import { NewVoucherModal } from "../../components/NewVoucherModal";
import { NewPaymentVoucherModal } from "../../components/NewPaymentVoucherModal";
import { List, RowComponentProps } from "react-window";

import { toast } from "react-hot-toast";

interface WorkOrderListProps {
    onCreateClick: () => void;
    onEditClick: (order: WorkOrder) => void;
    workTypeId?: string;
}

export const WorkOrderList: React.FC<WorkOrderListProps> = ({
    onCreateClick,
    onEditClick,
    workTypeId,
}) => {
    const [orders, setOrders] = useState<WorkOrder[]>([]);
    const [filter, setFilter] = useState<
        "pending" | "completed" | "overdue" | "all"
    >("all");
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [isPaymentVoucherModalOpen, setIsPaymentVoucherModalOpen] =
        useState(false);
    const [voucherInitialData, setVoucherInitialData] = useState<any>(null);
    const [paymentVoucherInitialData, setPaymentVoucherInitialData] =
        useState<any>(null);
    const [isTrashView, setIsTrashView] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const fetchData = async () => {
        try {
            const [o, w, wt, p] = await Promise.all([
                isTrashView
                    ? storage.getWorkOrderTrash()
                    : storage.getWorkOrders(),
                storage.getWorkers(),
                storage.getWorkTypes(),
                storage.getPurchases(),
            ]);
            setOrders(o);
            setWorkers(w);
            setWorkTypes(wt);
            setPurchases(p);
            setSelectedIds([]);
        } catch (error) {
            toast.error("Failed to fetch data");
        }
    };

    useEffect(() => {
        fetchData();
    }, [isTrashView]);

    const handleDelete = async (id: string | number) => {
        if (!window.confirm("Move this work order to trash?")) return;
        try {
            await storage.deleteWorkOrder(id);
            toast.success("Work order moved to trash");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete work order");
        }
    };

    const handleRestore = async (id: string | number) => {
        try {
            await storage.restoreWorkOrder(id);
            toast.success("Work order restored");
            fetchData();
        } catch (error) {
            toast.error("Failed to restore work order");
        }
    };

    const handleForceDelete = async (id: string | number) => {
        if (
            !window.confirm(
                "Are you sure? This will permanently delete the work order!",
            )
        )
            return;
        try {
            await storage.forceDeleteWorkOrder(id);
            toast.success("Work order permanently deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete work order permanently");
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Move ${selectedIds.length} work orders to trash?`))
            return;
        try {
            await storage.bulkDeleteWorkOrders(selectedIds);
            toast.success(`${selectedIds.length} work orders moved to trash`);
            fetchData();
        } catch (error) {
            toast.error("Bulk delete failed");
        }
    };

    const handleBulkRestore = async () => {
        try {
            await storage.bulkRestoreWorkOrders(selectedIds);
            toast.success(`${selectedIds.length} work orders restored`);
            fetchData();
        } catch (error) {
            toast.error("Bulk restore failed");
        }
    };

    const handleBulkForceDelete = async () => {
        if (
            !window.confirm(
                `Permanently delete ${selectedIds.length} work orders? This cannot be undone!`,
            )
        )
            return;
        try {
            await storage.bulkForceDeleteWorkOrders(selectedIds);
            toast.success(
                `${selectedIds.length} work orders permanently deleted`,
            );
            fetchData();
        } catch (error) {
            toast.error("Bulk force delete failed");
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredOrders.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredOrders.map((o) => String(o.id)));
        }
    };

    const today = new Date().toISOString().split("T")[0];

    // Reset status filter when work type changes
    useEffect(() => {
        setFilter("all");
    }, [workTypeId]);

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
        const totalReceived =
            order.vouchers?.reduce(
                (sum, v) => sum + Number(v.total_received),
                0,
            ) || 0;
        const isCompleted =
            order.no_of_pieces && totalReceived >= order.no_of_pieces;

        if (filter === "all") return true;
        if (filter === "pending") return !isCompleted;
        if (filter === "completed") return isCompleted;
        if (filter === "overdue") return !isCompleted && order.deadline < today;
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
        const isSelected = selectedIds.includes(String(order.id));

        return (
            <div
                style={style}
                {...props}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white transition-colors ${isSelected ? "bg-brand-50/30" : ""}`}
            >
                <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center mt-6">
                        <button
                            onClick={() => toggleSelect(String(order.id))}
                            className="text-gray-400 hover:text-brand-600 transition-colors"
                        >
                            {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-brand-600" />
                            ) : (
                                <Square className="w-5 h-5" />
                            )}
                        </button>
                    </div>
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
                            {(() => {
                                const totalReceived =
                                    order.vouchers?.reduce(
                                        (sum, v) =>
                                            sum + Number(v.total_received),
                                        0,
                                    ) || 0;
                                const isCompleted =
                                    order.no_of_pieces &&
                                    totalReceived >= order.no_of_pieces;
                                return (
                                    <>
                                        <span
                                            className={`px-2 inline-flex text-[10px] uppercase font-black tracking-widest leading-5 rounded-full ${!isCompleted ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
                                        >
                                            {isCompleted
                                                ? "COMPLETED"
                                                : "ACTIVE"}
                                        </span>
                                        {!isCompleted &&
                                            order.deadline < today && (
                                                <span className="px-2 inline-flex text-[10px] uppercase font-black tracking-widest leading-5 rounded-full bg-red-100 text-red-700">
                                                    OVERDUE
                                                </span>
                                            )}
                                    </>
                                );
                            })()}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            Worker:{" "}
                            <span className="font-medium text-gray-700">
                                {getWorkerName(order.worker_id)}
                            </span>{" "}
                            | Khilai: {getPurchaseInfo(order.purchase_id)} |
                            Items: {order.items?.length || 0}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            <span>Deadline: {order.deadline}</span>
                            {order.price_per_pc && (
                                <span className="text-gray-600 font-black">
                                    Rate: ₹{order.price_per_pc}
                                </span>
                            )}
                            {order.no_of_pieces && (
                                <span className="text-blue-600 font-bold">
                                    Total: {order.no_of_pieces} pcs
                                </span>
                            )}
                            {(() => {
                                const totalReceived =
                                    order.vouchers?.reduce(
                                        (sum, v) =>
                                            sum + Number(v.total_received),
                                        0,
                                    ) || 0;
                                const due =
                                    (order.no_of_pieces || 0) - totalReceived;
                                const monetaryDue =
                                    due * (order.price_per_pc || 0);

                                return (
                                    <>
                                        {totalReceived > 0 && (
                                            <span className="text-emerald-600 font-bold">
                                                Recv: {totalReceived} pcs
                                            </span>
                                        )}
                                        {due > 0 && (
                                            <span className="text-red-500 font-black">
                                                Due: {due} pcs
                                                {order.price_per_pc ? (
                                                    <span className="ml-1 opacity-70">
                                                        (₹
                                                        {monetaryDue.toLocaleString()}
                                                        )
                                                    </span>
                                                ) : null}
                                            </span>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isTrashView ? (
                        <>
                            <button
                                onClick={() => handleRestore(order.id)}
                                className="p-2 text-emerald-600 hover:text-emerald-800"
                                title="Restore"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleForceDelete(order.id)}
                                className="p-2 text-red-600 hover:text-red-800"
                                title="Delete Permanently"
                            >
                                <Trash className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex -space-x-2 overflow-hidden mr-2">
                                {order.vouchers?.slice(0, 3).map((v, i) => (
                                    <div
                                        key={v.id}
                                        title={`Voucher ${v.voucher_no}: ${v.total_received} pcs`}
                                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-emerald-100 flex items-center justify-center text-[8px] font-black text-emerald-700"
                                    >
                                        V
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => onEditClick(order)}
                                className="p-2 text-brand-600 hover:text-brand-800"
                                title="Edit Work Order"
                            >
                                <Edit className="w-5 h-5" />
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
                            <button
                                onClick={() => {
                                    const totalReceived =
                                        order.vouchers?.reduce(
                                            (sum, v) =>
                                                sum + Number(v.total_received),
                                            0,
                                        ) || 0;
                                    const totalDue =
                                        (order.no_of_pieces || 0) -
                                        totalReceived;

                                    setVoucherInitialData({
                                        type: "work-order",
                                        id: order.id,
                                        totalDue: totalDue > 0 ? totalDue : 0,
                                        description: `Return for Work Order #${String(order.id).slice(-6).toUpperCase()}`,
                                    });
                                    setIsVoucherModalOpen(true);
                                }}
                                className="p-2 text-emerald-500 hover:text-emerald-700"
                                title="Create Voucher"
                            >
                                <CreditCard className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => {
                                    setPaymentVoucherInitialData({
                                        type: "work-order",
                                        id: order.id,
                                        totalDue: 0,
                                        description: `Payment for Work Order #${String(order.id).slice(-6).toUpperCase()}`,
                                    });
                                    setIsPaymentVoucherModalOpen(true);
                                }}
                                className="p-2 text-blue-500 hover:text-blue-700"
                                title="Create Payment Voucher"
                            >
                                <svg
                                    className="w-5 h-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </button>
                            <button
                                onClick={() => handleDelete(order.id)}
                                className="p-2 text-red-400 hover:text-red-600 font-bold"
                                title="Delete"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isTrashView
                            ? `Trashed ${activeWorkTypeName ?? "Work Orders"}`
                            : (activeWorkTypeName ?? "Work Orders")}
                    </h2>
                    <button
                        onClick={() => setIsTrashView(!isTrashView)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${isTrashView ? "bg-brand-50 text-brand-700 border border-brand-200" : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"}`}
                    >
                        {isTrashView ? (
                            <>
                                <RotateCcw className="w-4 h-4" /> Back to Active
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" /> View Trash
                            </>
                        )}
                    </button>
                </div>
                {!isTrashView && (
                    <button
                        onClick={onCreateClick}
                        className="btn-primary flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 font-bold"
                    >
                        <Plus className="w-4 h-4" /> Create Work Order
                    </button>
                )}
            </div>

            {selectedIds.length > 0 && (
                <div className="bg-brand-600 text-white px-6 py-3 rounded-xl flex justify-between items-center shadow-lg animate-in slide-in-from-top-4 duration-300">
                    <span className="font-bold">
                        {selectedIds.length} selected
                    </span>
                    <div className="flex gap-3">
                        {isTrashView ? (
                            <>
                                <button
                                    onClick={handleBulkRestore}
                                    className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold flex items-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" /> Restore
                                </button>
                                <button
                                    onClick={handleBulkForceDelete}
                                    className="px-4 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-bold flex items-center gap-2"
                                >
                                    <Trash className="w-4 h-4" /> Delete Forever
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Move to Trash
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
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
                                            const totalReceived =
                                                o.vouchers?.reduce(
                                                    (sum, v) =>
                                                        sum +
                                                        Number(
                                                            v.total_received,
                                                        ),
                                                    0,
                                                ) || 0;
                                            const isCompleted =
                                                o.no_of_pieces &&
                                                totalReceived >= o.no_of_pieces;

                                            if (f === "all") return true;
                                            if (f === "pending")
                                                return !isCompleted;
                                            if (f === "completed")
                                                return isCompleted;
                                            if (f === "overdue")
                                                return (
                                                    !isCompleted &&
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
                <div className="flex items-center pr-4">
                    <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-gray-500 hover:text-brand-600 font-bold text-sm transition-colors"
                    >
                        {selectedIds.length === filteredOrders.length &&
                        filteredOrders.length > 0 ? (
                            <CheckSquare className="w-5 h-5 text-brand-600" />
                        ) : (
                            <Square className="w-5 h-5" />
                        )}
                        Select All
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 h-[600px] relative">
                {filteredOrders.length > 0 ? (
                    <List
                        rowCount={filteredOrders.length}
                        rowHeight={100}
                        style={{ height: 600, width: "100%" }}
                        rowComponent={Row}
                        rowProps={{}}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-12">
                        <div className="mb-4">
                            <Trash2 className="w-16 h-16 text-gray-200" />
                        </div>
                        <p className="text-xl font-medium text-gray-900">
                            No {filter === "all" ? "" : filter} work orders
                            found
                        </p>
                        <p className="mt-1">
                            {isTrashView
                                ? "Your trash is empty"
                                : filter === "all"
                                  ? "Start by creating your first work order."
                                  : "Try changing the filter to see more orders."}
                        </p>
                    </div>
                )}
            </div>

            <NewVoucherModal
                isOpen={isVoucherModalOpen}
                onClose={() => setIsVoucherModalOpen(false)}
                onSave={() => {
                    setIsVoucherModalOpen(false);
                    fetchData();
                }}
                initialData={voucherInitialData}
            />

            <NewPaymentVoucherModal
                isOpen={isPaymentVoucherModalOpen}
                onClose={() => setIsPaymentVoucherModalOpen(false)}
                onSave={() => {
                    setIsPaymentVoucherModalOpen(false);
                    fetchData();
                }}
                initialData={paymentVoucherInitialData}
            />
        </div>
    );
};
