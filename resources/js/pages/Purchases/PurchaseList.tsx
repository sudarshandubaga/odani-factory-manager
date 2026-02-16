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
} from "lucide-react";

interface PurchaseListProps {
    onCreateClick: () => void;
}

export const PurchaseList: React.FC<PurchaseListProps> = ({
    onCreateClick,
}) => {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [selectedPurchaseDetails, setSelectedPurchaseDetails] =
        useState<Purchase | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await storage.getPurchases();
            setPurchases(data);
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Purchases</h2>
                <button
                    onClick={onCreateClick}
                    className="btn-primary flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700"
                >
                    <Plus className="w-4 h-4" /> New Purchase
                </button>
            </div>
            <div className="bg-white shadow overflow-hidden rounded-md h-[500px] relative">
                <div className="grid grid-cols-5 bg-gray-50 border-b border-gray-200">
                    <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                    </div>
                    <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                    </div>
                    <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                    </div>
                    <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                    </div>
                    <div className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                    </div>
                </div>
                {purchases.length > 0 ? (
                    <div className="overflow-y-auto" style={{ height: 440 }}>
                        {purchases.map((p) => (
                            <div
                                key={p.id}
                                className="grid grid-cols-5 border-b border-gray-200 items-center hover:bg-gray-50"
                            >
                                <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {p.date}
                                </div>
                                <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {p.invoice_no}
                                </div>
                                <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {p.supplier?.name || "Unknown"}
                                </div>
                                <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {p.items_count}
                                </div>
                                <div className="px-6 py-4 whitespace-nowrap flex justify-end gap-2 text-end text-sm font-medium">
                                    <button
                                        onClick={() =>
                                            setSelectedPurchaseDetails(p)
                                        }
                                        className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                                    >
                                        <Eye className="w-4 h-4" /> Details
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
                                        className="text-brand-600 hover:text-brand-900 flex items-center justify-end gap-1"
                                    >
                                        <Printer className="w-4 h-4" /> Print
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-6 py-4 text-center text-gray-500">
                        No records found
                    </div>
                )}
            </div>

            {selectedPurchaseDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-brand-600 text-white">
                            <div>
                                <h3 className="text-xl font-bold">
                                    Purchase Information
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
                                        Supplier
                                    </p>
                                    <p className="font-bold text-gray-900">
                                        {selectedPurchaseDetails.supplier?.name}
                                    </p>
                                    <p className="text-sm text-brand-600 font-medium">
                                        {
                                            selectedPurchaseDetails.supplier
                                                ?.shopName
                                        }
                                    </p>
                                    {selectedPurchaseDetails.supplier
                                        ?.mobile && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Mob:{" "}
                                            {
                                                selectedPurchaseDetails.supplier
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
                                        <div className="flex justify-between text-sm">
                                            <span>Total Items:</span>
                                            <span className="font-bold">
                                                {selectedPurchaseDetails.items
                                                    ?.length || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Total Pieces:</span>
                                            <span className="font-bold">
                                                {selectedPurchaseDetails.items?.reduce(
                                                    (sum, i) =>
                                                        sum + i.pieces_round,
                                                    0,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                                            {item.pieces_round}
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
                                                            sum + i.size_meters,
                                                        0,
                                                    )
                                                    .toFixed(2)}{" "}
                                                m
                                            </td>
                                            <td className="px-4 py-3"></td>
                                            <td className="px-4 py-3 text-brand-600 font-bold">
                                                {selectedPurchaseDetails.items?.reduce(
                                                    (sum, i) =>
                                                        sum + i.pieces_round,
                                                    0,
                                                )}{" "}
                                                Pcs
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
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
        </div>
    );
};
