import React, { useState, useEffect } from "react";
import { storage } from "../../services/storage";
import { Purchase } from "../../types";
import {
    Plus,
    Printer,
    Eye,
    X,
    Building2,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    Edit,
    Trash2,
    RotateCcw,
    Trash,
    CheckSquare,
    Square,
} from "lucide-react";
import { NewVoucherModal } from "../../components/NewVoucherModal";
import { toast } from "react-hot-toast";

interface PurchaseListProps {
    onCreateClick: () => void;
    onEditClick: (purchase: Purchase) => void;
}

export const PurchaseList: React.FC<PurchaseListProps> = ({
    onCreateClick,
    onEditClick,
}) => {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [selectedPurchaseDetails, setSelectedPurchaseDetails] =
        useState<Purchase | null>(null);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [voucherInitialData, setVoucherInitialData] = useState<any>(null);
    const [isTrashView, setIsTrashView] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const fetchData = async () => {
        try {
            const data = isTrashView
                ? await storage.getPurchaseTrash()
                : await storage.getPurchases();
            setPurchases(data);
            setSelectedIds([]);
        } catch (error) {
            toast.error("Failed to fetch purchases");
        }
    };

    useEffect(() => {
        fetchData();
    }, [isTrashView]);

    const handleDelete = async (id: string | number) => {
        if (!window.confirm("Move this purchase to trash?")) return;
        try {
            await storage.deletePurchase(id);
            toast.success("Purchase moved to trash");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete purchase");
        }
    };

    const handleRestore = async (id: string | number) => {
        try {
            await storage.restorePurchase(id);
            toast.success("Purchase restored");
            fetchData();
        } catch (error) {
            toast.error("Failed to restore purchase");
        }
    };

    const handleForceDelete = async (id: string | number) => {
        if (
            !window.confirm(
                "Are you sure? This will permanently delete the purchase and all its items!",
            )
        )
            return;
        try {
            await storage.forceDeletePurchase(id);
            toast.success("Purchase permanently deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete purchase permanently");
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Move ${selectedIds.length} purchases to trash?`))
            return;
        try {
            await storage.bulkDeletePurchases(selectedIds);
            toast.success(`${selectedIds.length} purchases moved to trash`);
            fetchData();
        } catch (error) {
            toast.error("Bulk delete failed");
        }
    };

    const handleBulkRestore = async () => {
        try {
            await storage.bulkRestorePurchases(selectedIds);
            toast.success(`${selectedIds.length} purchases restored`);
            fetchData();
        } catch (error) {
            toast.error("Bulk restore failed");
        }
    };

    const handleBulkForceDelete = async () => {
        if (
            !window.confirm(
                `Permanently delete ${selectedIds.length} purchases? This cannot be undone!`,
            )
        )
            return;
        try {
            await storage.bulkForceDeletePurchases(selectedIds);
            toast.success(
                `${selectedIds.length} purchases permanently deleted`,
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
        if (selectedIds.length === purchases.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(purchases.map((p) => String(p.id)));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 font-serif">
                        {isTrashView ? "Trashed Khilai" : "Khilai"}
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
                        <Plus className="w-4 h-4" /> New Khilai
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

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 min-h-[500px] relative">
                <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_1fr_1fr_1fr_150px] bg-gray-50/50 border-b border-gray-200">
                    <div className="px-4 py-3 flex items-center">
                        <button
                            onClick={toggleSelectAll}
                            className="text-gray-400 hover:text-brand-600 transition-colors"
                        >
                            {selectedIds.length === purchases.length &&
                            purchases.length > 0 ? (
                                <CheckSquare className="w-5 h-5 text-brand-600" />
                            ) : (
                                <Square className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <div className="px-6 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                        Date
                    </div>
                    <div className="px-6 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                        Khilai ID
                    </div>
                    <div className="px-6 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                        Invoice
                    </div>
                    <div className="px-6 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                        Worker
                    </div>
                    <div className="px-6 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wider">
                        Total Pcs
                    </div>
                    <div className="px-6 py-3 text-left text-xs font-black text-emerald-600 uppercase tracking-wider">
                        Received
                    </div>
                    <div className="px-6 py-3 text-left text-xs font-black text-red-600 uppercase tracking-wider">
                        Due
                    </div>
                    <div className="px-6 py-3 text-right text-xs font-black text-gray-400 uppercase tracking-wider">
                        Actions
                    </div>
                </div>
                {purchases.length > 0 ? (
                    <div className="overflow-y-auto" style={{ height: 440 }}>
                        {purchases.map((p) => {
                            const received =
                                p.vouchers?.reduce(
                                    (sum, v) => sum + Number(v.total_received),
                                    0,
                                ) || 0;
                            const due = (p.total_pieces || 0) - received;
                            const isSelected = selectedIds.includes(
                                String(p.id),
                            );
                            return (
                                <div
                                    key={p.id}
                                    className={`grid grid-cols-[40px_1fr_1fr_1fr_1fr_1fr_1fr_1fr_150px] border-b border-gray-100 items-center hover:bg-gray-50 transition-colors ${isSelected ? "bg-brand-50/30" : ""}`}
                                >
                                    <div className="px-4 py-4 flex items-center">
                                        <button
                                            onClick={() =>
                                                toggleSelect(String(p.id))
                                            }
                                            className="text-gray-400 hover:text-brand-600 transition-colors"
                                        >
                                            {isSelected ? (
                                                <CheckSquare className="w-5 h-5 text-brand-600" />
                                            ) : (
                                                <Square className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                        {p.date}
                                    </div>
                                    <div className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-600">
                                        #{String(p.id).padStart(4, "0")}
                                    </div>
                                    <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                        {p.invoice_no}
                                    </div>
                                    <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                        {p.worker?.name || "Unknown"}
                                    </div>
                                    <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">
                                        {p.total_pieces}
                                    </div>
                                    <div className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-black">
                                        {received}
                                    </div>
                                    <div className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-black">
                                        {due}
                                    </div>
                                    <div className="px-6 py-4 whitespace-nowrap flex justify-end gap-3 text-end text-sm font-medium">
                                        {isTrashView ? (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        handleRestore(p.id)
                                                    }
                                                    className="text-emerald-600 hover:text-emerald-900 font-bold flex items-center gap-1"
                                                    title="Restore"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleForceDelete(p.id)
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
                                                        setSelectedPurchaseDetails(
                                                            p,
                                                        )
                                                    }
                                                    className="text-gray-600 hover:text-gray-900 flex items-center gap-1 font-bold"
                                                    title="Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setVoucherInitialData({
                                                            type: "khilai",
                                                            id: p.id,
                                                            totalDue:
                                                                due > 0
                                                                    ? due
                                                                    : 0,
                                                            description: `Payment for Khilai Inv #${p.invoice_no}`,
                                                        });
                                                        setIsVoucherModalOpen(
                                                            true,
                                                        );
                                                    }}
                                                    className="text-emerald-600 hover:text-emerald-900 flex items-center gap-1 font-bold"
                                                    title="Voucher"
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        onEditClick(p)
                                                    }
                                                    className="text-brand-600 hover:text-brand-900 flex items-center gap-1 font-bold"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const url = `#/purchase/${p.id}/print`;
                                                        window.open(
                                                            url,
                                                            "PrintWindow",
                                                            "width=900,height=800,scrollbars=yes",
                                                        );
                                                    }}
                                                    className="text-brand-600 hover:text-brand-900 flex items-center justify-end gap-1 font-bold"
                                                    title="Print"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(p.id)
                                                    }
                                                    className="text-red-400 hover:text-red-600 font-bold flex items-center gap-1"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                        <Trash2 className="w-16 h-16 text-gray-200 mb-4" />
                        <p className="text-xl font-medium">No records found</p>
                        <p className="text-sm">
                            {isTrashView
                                ? "Your trash is empty"
                                : "Start by creating a new Khilai entry"}
                        </p>
                    </div>
                )}
            </div>

            {selectedPurchaseDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-brand-600 text-white">
                            <div>
                                <h3 className="text-xl font-bold">
                                    Khilai Information
                                </h3>
                                <p className="text-sm opacity-90">
                                    Invoice:{" "}
                                    {selectedPurchaseDetails.invoice_no} | Date:{" "}
                                    {selectedPurchaseDetails.date}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedPurchaseDetails(null)}
                                className="p-2 hover:bg-brand-700 rounded-full"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
                                        Worker
                                    </p>
                                    <p className="font-bold text-gray-900">
                                        {selectedPurchaseDetails.worker?.name}
                                    </p>
                                    <p className="text-sm text-brand-600 font-medium">
                                        {selectedPurchaseDetails.worker?.email}
                                    </p>
                                    {selectedPurchaseDetails.worker?.mobile && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Mob:{" "}
                                            {
                                                selectedPurchaseDetails.worker
                                                    .mobile
                                            }
                                        </p>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
                                        Configuration
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">
                                            Pat Size:
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            {selectedPurchaseDetails.pat_size} m
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-brand-50 p-4 rounded-lg border border-brand-100">
                                    <p className="text-xs text-brand-600 font-bold uppercase tracking-wider mb-2">
                                        Summary
                                    </p>
                                    <div className="space-y-1">
                                        {selectedPurchaseDetails.item_type ===
                                            "lot" && (
                                            <div className="flex justify-between text-sm">
                                                <span>Total Items:</span>
                                                <span className="font-bold">
                                                    {selectedPurchaseDetails
                                                        .items?.length || 0}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span>Total Pieces:</span>
                                            <span className="font-bold">
                                                {
                                                    selectedPurchaseDetails.total_pieces
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedPurchaseDetails.item_type === "lot" && (
                                <div className="border rounded-lg overflow-hidden shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Sr. No
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Size (m)
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Pat (Dec/Round)
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Pieces (Dec/Round)
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedPurchaseDetails.items?.map(
                                                (item) => (
                                                    <tr
                                                        key={item.id}
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="px-4 py-3 text-sm text-gray-900 border-r">
                                                            {item.s_no}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                                                            {item.size_meters} m
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">
                                                            <span className="text-gray-400">
                                                                {item.pat_raw.toFixed(
                                                                    2,
                                                                )}
                                                            </span>{" "}
                                                            /{" "}
                                                            <span className="font-bold text-gray-700">
                                                                {item.pat_round}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">
                                                            <span className="text-gray-400">
                                                                {item.pieces_raw.toFixed(
                                                                    2,
                                                                )}
                                                            </span>{" "}
                                                            /{" "}
                                                            <span className="font-bold text-brand-600">
                                                                {
                                                                    item.pieces_round
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${item.status === "completed" ? "bg-green-100 text-green-700 border border-green-200" : item.status === "assigned" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-yellow-100 text-yellow-700 border border-yellow-200"}`}
                                                            >
                                                                {item.status.toUpperCase()}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr className="font-bold text-gray-900">
                                                <td
                                                    className="px-4 py-3 text-xs uppercase"
                                                    colSpan={1}
                                                >
                                                    Total
                                                </td>
                                                <td className="px-4 py-3">
                                                    {selectedPurchaseDetails.items
                                                        ?.reduce(
                                                            (sum, i) =>
                                                                sum +
                                                                i.size_meters,
                                                            0,
                                                        )
                                                        .toFixed(2)}{" "}
                                                    m
                                                </td>
                                                <td className="px-4 py-3"></td>
                                                <td className="px-4 py-3 text-brand-600 font-bold">
                                                    {selectedPurchaseDetails.items?.reduce(
                                                        (sum, i) =>
                                                            sum +
                                                            i.pieces_round,
                                                        0,
                                                    )}{" "}
                                                    Pcs
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}

                            {selectedPurchaseDetails.vouchers &&
                                selectedPurchaseDetails.vouchers.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-dashed">
                                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-emerald-600" />{" "}
                                            Payment Vouchers
                                        </h4>
                                        <div className="bg-emerald-50/30 rounded-xl border border-emerald-100 divide-y divide-emerald-100">
                                            {selectedPurchaseDetails.vouchers.map(
                                                (v) => (
                                                    <div
                                                        key={v.id}
                                                        className="p-3 flex justify-between items-center hover:bg-emerald-50/50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-emerald-100 p-2 rounded-lg">
                                                                <CreditCard className="w-4 h-4 text-emerald-700" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">
                                                                    {
                                                                        v.voucher_no
                                                                    }
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 font-medium">
                                                                    {v.date}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-black text-emerald-700">
                                                                {
                                                                    v.total_received
                                                                }
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 uppercase font-black">
                                                                Received
                                                            </p>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                        <div className="flex gap-3 justify-end p-2">
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 mr-2 uppercase tracking-widest font-black">
                                                    Total Recieved (Pcs):
                                                </span>
                                                <span className="text-lg font-black text-emerald-600">
                                                    {selectedPurchaseDetails.vouchers.reduce(
                                                        (sum, v) =>
                                                            sum +
                                                            Number(
                                                                v.total_received,
                                                            ),
                                                        0,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 mr-2 uppercase tracking-widest font-black">
                                                    Total Due (Pcs):
                                                </span>
                                                <span className="text-lg font-black text-red-600">
                                                    {(selectedPurchaseDetails.total_pieces ||
                                                        0) -
                                                        selectedPurchaseDetails.vouchers.reduce(
                                                            (sum, v) =>
                                                                sum +
                                                                Number(
                                                                    v.total_received,
                                                                ),
                                                            0,
                                                        )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                            <p className="text-xs text-gray-400">
                                System Created:{" "}
                                {new Date(
                                    selectedPurchaseDetails.created_at,
                                ).toLocaleString()}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() =>
                                        setSelectedPurchaseDetails(null)
                                    }
                                    className="px-6 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        const totalReceived =
                                            selectedPurchaseDetails.vouchers?.reduce(
                                                (sum, v) =>
                                                    sum +
                                                    Number(v.total_received),
                                                0,
                                            ) || 0;
                                        const totalDue =
                                            (selectedPurchaseDetails.total_pieces ||
                                                0) - totalReceived;

                                        setVoucherInitialData({
                                            type: "khilai",
                                            id: selectedPurchaseDetails.id,
                                            totalDue:
                                                totalDue > 0 ? totalDue : 0,
                                            description: `Payment for Khilai Inv #${selectedPurchaseDetails.invoice_no}`,
                                        });
                                        setIsVoucherModalOpen(true);
                                    }}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 shadow-sm flex items-center gap-2"
                                >
                                    <CreditCard className="w-4 h-4" /> Create
                                    Voucher
                                </button>
                                <button
                                    onClick={() => {
                                        const url = `#/purchase/${selectedPurchaseDetails.id}/print`;
                                        window.open(
                                            url,
                                            "PrintWindow",
                                            "width=900,height=800,scrollbars=yes",
                                        );
                                    }}
                                    className="px-6 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 shadow-sm flex items-center gap-2"
                                >
                                    <Printer className="w-4 h-4" /> Print Full
                                    Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <NewVoucherModal
                isOpen={isVoucherModalOpen}
                onClose={() => setIsVoucherModalOpen(false)}
                onSave={() => {
                    setIsVoucherModalOpen(false);
                    fetchData(); // Refresh if needed
                }}
                initialData={voucherInitialData}
            />
        </div>
    );
};
