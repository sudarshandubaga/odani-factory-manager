import React, { useState, useEffect } from "react";
import { storage } from "../../services/storage";
import { PaymentVoucher } from "../../types";
import {
    Edit,
    Plus,
    Printer,
    Eye,
    X,
    Calendar,
    Hash,
    Receipt,
    FileText,
    Trash2,
    RotateCcw,
    Trash,
    CheckSquare,
    Square,
    Image as ImageIcon,
} from "lucide-react";
import { NewPaymentVoucherModal } from "../../components/NewPaymentVoucherModal";
import { toast } from "react-hot-toast";
import { formatNumber } from "../../utils";

export const PaymentVoucherList: React.FC = () => {
    const [paymentVouchers, setPaymentVouchers] = useState<PaymentVoucher[]>([]);
    const [selectedPaymentVoucher, setSelectedPaymentVoucher] = useState<PaymentVoucher | null>(
        null,
    );
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [isTrashView, setIsTrashView] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const fetchPaymentVouchers = async () => {
        try {
            const data = isTrashView
                ? await storage.getPaymentVoucherTrash()
                : await storage.getPaymentVouchers();
            setPaymentVouchers(data);
            setSelectedIds([]); // Clear selection on view change
        } catch (error) {
            toast.error("Failed to fetch paymentVouchers");
        }
    };

    useEffect(() => {
        fetchPaymentVouchers();
    }, [isTrashView]);

    const handleEditClick = (v: PaymentVoucher) => {
        setEditData({
            editId: v.id,
            type: v.type,
            id:
                v.type === "khilai"
                    ? String(v.khilai_id)
                    : String(v.work_order_id),
            totalDue: Number(v.total_due),
            price: Number(v.price),
            description: v.description,
            date: v.date,
            image: v.image,
            workType: v.workOrder?.workType?.name,
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string | number) => {
        if (!window.confirm("Move this paymentVoucher to trash?")) return;
        try {
            await storage.deletePaymentVoucher(id);
            toast.success("PaymentVoucher moved to trash");
            fetchPaymentVouchers();
        } catch (error) {
            toast.error("Failed to delete paymentVoucher");
        }
    };

    const handleRestore = async (id: string | number) => {
        try {
            await storage.restorePaymentVoucher(id);
            toast.success("PaymentVoucher restored");
            fetchPaymentVouchers();
        } catch (error) {
            toast.error("Failed to restore paymentVoucher");
        }
    };

    const handleForceDelete = async (id: string | number) => {
        if (
            !window.confirm(
                "Are you sure? This will permanently delete the paymentVoucher!",
            )
        )
            return;
        try {
            await storage.forceDeletePaymentVoucher(id);
            toast.success("PaymentVoucher permanently deleted");
            fetchPaymentVouchers();
        } catch (error) {
            toast.error("Failed to delete paymentVoucher permanently");
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Move ${selectedIds.length} paymentVouchers to trash?`))
            return;
        try {
            await storage.bulkDeletePaymentVouchers(selectedIds);
            toast.success(`${selectedIds.length} paymentVouchers moved to trash`);
            fetchPaymentVouchers();
        } catch (error) {
            toast.error("Bulk delete failed");
        }
    };

    const handleBulkRestore = async () => {
        try {
            await storage.bulkRestorePaymentVouchers(selectedIds);
            toast.success(`${selectedIds.length} paymentVouchers restored`);
            fetchPaymentVouchers();
        } catch (error) {
            toast.error("Bulk restore failed");
        }
    };

    const handleBulkForceDelete = async () => {
        if (
            !window.confirm(
                `Permanently delete ${selectedIds.length} paymentVouchers? This cannot be undone!`,
            )
        )
            return;
        try {
            await storage.bulkForceDeletePaymentVouchers(selectedIds);
            toast.success(`${selectedIds.length} paymentVouchers permanently deleted`);
            fetchPaymentVouchers();
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
        if (selectedIds.length === paymentVouchers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paymentVouchers.map((v) => String(v.id)));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 font-serif">
                        {isTrashView ? "Trashed PaymentVouchers" : "PaymentVouchers"}
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

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left w-10">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="text-gray-400 hover:text-brand-600 transition-colors"
                                    >
                                        {selectedIds.length ===
                                            paymentVouchers.length &&
                                        paymentVouchers.length > 0 ? (
                                            <CheckSquare className="w-5 h-5 text-brand-600" />
                                        ) : (
                                            <Square className="w-5 h-5" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Voucher No
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Source
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest text-right">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {paymentVouchers.map((v) => (
                                <tr
                                    key={v.id}
                                    className={`hover:bg-gray-50/50 transition-colors ${selectedIds.includes(String(v.id)) ? "bg-brand-50/30" : ""}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() =>
                                                toggleSelect(String(v.id))
                                            }
                                            className="text-gray-400 hover:text-brand-600 transition-colors"
                                        >
                                            {selectedIds.includes(
                                                String(v.id),
                                            ) ? (
                                                <CheckSquare className="w-5 h-5 text-brand-600" />
                                            ) : (
                                                <Square className="w-5 h-5" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                        {v.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {v.voucher_no}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${v.type === "khilai" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}
                                                >
                                                    {v.type === "khilai"
                                                        ? "Khilai Entry"
                                                        : "Work Order"}
                                                </span>
                                                {v.workOrder?.workType
                                                    ?.name && (
                                                    <span className="text-[9px] font-bold text-blue-600 uppercase">
                                                        {
                                                            v.workOrder.workType
                                                                .name
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-0.5">
                                                {v.type === "khilai"
                                                    ? `Inv #${v.khilai?.invoice_no}`
                                                    : `Job #${v.work_order_id}`}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900 text-right">
                                        ₹{formatNumber(v.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {isTrashView
                                                ? "Trashed"
                                                : "Received"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex items-center gap-3 justify-end">
                                            {isTrashView ? (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleRestore(v.id)
                                                        }
                                                        className="text-emerald-600 hover:text-emerald-900 font-bold flex items-center gap-1"
                                                        title="Restore"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleForceDelete(
                                                                v.id,
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900 font-bold flex items-center gap-1"
                                                        title="Delete Permanently"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            setSelectedPaymentVoucher(
                                                                v,
                                                            )
                                                        }
                                                        className="text-gray-600 hover:text-gray-900 font-bold flex items-center gap-1"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleEditClick(v)
                                                        }
                                                        className="text-brand-600 hover:text-brand-900 font-bold flex items-center gap-1"
                                                        title="Edit PaymentVoucher"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(v.id)
                                                        }
                                                        className="text-red-400 hover:text-red-600 font-bold flex items-center gap-1"
                                                        title="Delete PaymentVoucher"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paymentVouchers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        <Receipt className="w-12 h-12 mx-auto text-gray-200 mb-2" />
                                        <p className="text-lg font-medium">
                                            No paymentVouchers found
                                        </p>
                                        <p className="text-sm">
                                            Create paymentVouchers from Khilai or Work
                                            Orders to see them here.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedPaymentVoucher && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-900 text-white">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Receipt className="w-6 h-6 text-brand-400" />
                                    PaymentVoucher Details
                                </h3>
                                <p className="text-sm text-gray-400 tracking-widest uppercase font-black">
                                    {selectedPaymentVoucher.voucher_no}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedPaymentVoucher(null)}
                                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <section>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                        Received Details
                                    </label>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">
                                                Date:
                                            </span>
                                            <span className="font-bold text-gray-900">
                                                {selectedPaymentVoucher.date}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">
                                                Pieces Received:
                                            </span>
                                            <span className="text-xl font-black text-emerald-600">
                                                ₹{formatNumber(selectedPaymentVoucher.price)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">
                                                Total Due:
                                            </span>
                                            <span className="font-bold text-gray-900">
                                                ₹{formatNumber(selectedPaymentVoucher.total_due)}
                                            </span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between items-center">
                                            <span className="text-sm text-gray-500">
                                                Remaining Balance:
                                            </span>
                                            <span className="font-bold text-red-600">
                                                ₹{formatNumber(
                                                    Math.max(
                                                        0,
                                                        selectedPaymentVoucher.total_due -
                                                            (selectedPaymentVoucher.price ||
                                                                0),
                                                    ),
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                        Description / Notes
                                    </label>
                                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 italic text-sm text-amber-900 min-h-[60px]">
                                        {selectedPaymentVoucher.description ||
                                            "No description provided"}
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <section>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                        Source Information
                                    </label>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-bold text-gray-900">
                                                {selectedPaymentVoucher.type ===
                                                "khilai"
                                                    ? "Khilai Entry"
                                                    : "Work Order"}
                                            </p>
                                            {selectedPaymentVoucher.workOrder?.workType
                                                ?.name && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-black uppercase tracking-widest">
                                                    {
                                                        selectedPaymentVoucher
                                                            .workOrder.workType
                                                            .name
                                                    }
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {selectedPaymentVoucher.type === "khilai"
                                                ? `Worker: ${selectedPaymentVoucher.khilai?.worker?.name}`
                                                : `Worker: ${selectedPaymentVoucher.workOrder?.worker?.name}`}
                                        </p>
                                    </div>
                                </section>

                                {selectedPaymentVoucher.image && (
                                    <section>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                            Attachment / Receipt
                                        </label>
                                        <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-gray-200 aspect-video bg-gray-50">
                                            <img
                                                src={`/storage/${selectedPaymentVoucher.image}`}
                                                className="w-full h-full object-cover"
                                                alt="Receipt"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <button
                                                    onClick={() =>
                                                        window.open(
                                                            `/storage/${selectedPaymentVoucher.image}`,
                                                            "_blank",
                                                        )
                                                    }
                                                    className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-xl"
                                                >
                                                    <ImageIcon className="w-4 h-4" />{" "}
                                                    View Full Image
                                                </button>
                                            </div>
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedPaymentVoucher(null)}
                                className="px-6 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-6 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 flex items-center gap-2 transition-all"
                            >
                                <Printer className="w-4 h-4" /> Print PaymentVoucher
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <NewPaymentVoucherModal
                isOpen={isEditModalOpen}
                initialData={editData}
                onClose={() => setIsEditModalOpen(false)}
                onSave={() => {
                    fetchPaymentVouchers();
                    setIsEditModalOpen(false);
                }}
            />
        </div>
    );
};
