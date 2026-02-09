import React, { useState, useEffect } from "react";
import { storage } from "../services/storage";
import { Purchase, PurchaseItem, Supplier } from "../types";
import { Link } from "react-router-dom";
import {
    Plus,
    Trash,
    Printer,
    Save,
    FilePlus,
    ChevronLeft,
    Eye,
    X,
} from "lucide-react";
import { List, RowComponentProps } from "react-window";
import { SearchableSelect } from "../components/SearchableSelect";
import { NewSupplierModal } from "../components/NewSupplierModal";

export const PurchaseEntry: React.FC = () => {
    const [view, setView] = useState<"list" | "create">("list");
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedPurchaseDetails, setSelectedPurchaseDetails] =
        useState<Purchase | null>(null);

    console.log("selectedPurchaseDetails", selectedPurchaseDetails);

    // Form State
    const [supplierId, setSupplierId] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invoiceNo, setInvoiceNo] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [patSize, setPatSize] = useState<number>(2.5);
    const [items, setItems] = useState<PurchaseItem[]>([
        {
            id: "1",
            sNo: 1,
            sizeMeters: 0,
            patRaw: 0,
            patRound: 0,
            piecesRaw: 0,
            piecesRound: 0,
            status: "pending",
        },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            const [purchData, suppData] = await Promise.all([
                storage.getPurchases(),
                storage.getSuppliers(),
            ]);
            setPurchases(purchData);
            setSuppliers(suppData);
        };
        fetchData();
    }, [view]);

    const handleCreateSupplier = async (supplierData: Omit<Supplier, "id">) => {
        const newSup = await storage.addSupplier(supplierData);
        setSuppliers([...suppliers, newSup]);
        setSupplierId(newSup.id);
    };

    const handleItemChange = (
        id: string,
        field: "sizeMeters",
        value: number,
    ) => {
        setItems((prevItems) => {
            const updatedItems = prevItems.map((item) => {
                if (item.id !== id) return item;
                const sizeMeters = value || 0;
                const patRaw = patSize > 0 ? sizeMeters / patSize : 0;
                const patRound = Math.round(patRaw);
                const piecesRaw = Math.round((patRound / 3) * 2 * 100) / 100;
                const piecesRound = Math.round(piecesRaw);
                return {
                    ...item,
                    sizeMeters,
                    patRaw,
                    patRound,
                    piecesRaw,
                    piecesRound,
                };
            });

            // If the current item is the last one and it now has a value > 0, add a new row
            const currentIndex = updatedItems.findIndex(
                (item) => item.id === id,
            );
            if (currentIndex === updatedItems.length - 1 && value > 0) {
                return [
                    ...updatedItems,
                    {
                        id: Date.now().toString(),
                        sNo: updatedItems.length + 1,
                        sizeMeters: 0,
                        patRaw: 0,
                        patRound: 0,
                        piecesRaw: 0,
                        piecesRound: 0,
                        status: "pending",
                    },
                ];
            }
            return updatedItems;
        });
    };

    const addItemRow = () => {
        setItems([
            ...items,
            {
                id: Date.now().toString(),
                sNo: items.length + 1,
                sizeMeters: 0,
                patRaw: 0,
                patRound: 0,
                piecesRaw: 0,
                piecesRound: 0,
                status: "pending",
            },
        ]);
    };

    const removeItemRow = (id: string) => {
        if (items.length === 1) return;
        setItems(
            items
                .filter((i) => i.id !== id)
                .map((item, idx) => ({ ...item, sNo: idx + 1 })),
        );
    };

    const handleSave = async () => {
        if (!supplierId || !invoiceNo) {
            alert("Please fill required details");
            return;
        }
        const purchase = {
            supplier_id: supplierId,
            invoice_no: invoiceNo,
            date,
            pat_size: patSize,
            items: items
                .filter((i) => i.sizeMeters > 0)
                .map((i) => ({
                    s_no: i.sNo,
                    size_meters: i.sizeMeters,
                    pat_raw: i.patRaw,
                    pat_round: i.patRound,
                    pieces_raw: i.piecesRaw,
                    pieces_round: i.piecesRound,
                })),
        };
        await storage.addPurchase(purchase);
        setView("list");
        // Reset Form
        setInvoiceNo("");
        setItems([
            {
                id: "1",
                sNo: 1,
                sizeMeters: 0,
                patRaw: 0,
                patRound: 0,
                piecesRaw: 0,
                piecesRound: 0,
                status: "pending",
            },
        ]);
    };

    // Recalculate all items if Pat Size changes globally
    useEffect(() => {
        setItems((prev) =>
            prev.map((item) => {
                const patRaw = patSize > 0 ? item.sizeMeters / patSize : 0;
                const patRound = Math.round(patRaw);
                const piecesRaw = Math.round((patRaw / 3) * 2 * 100) / 100;
                const piecesRound = Math.round(piecesRaw);

                return {
                    ...item,
                    patRaw,
                    patRound,
                    piecesRaw,
                    piecesRound,
                };
            }),
        );
    }, [patSize]);

    if (view === "list") {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Purchases
                    </h2>
                    <button
                        onClick={() => setView("create")}
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
                        <List
                            rowCount={purchases.length}
                            rowHeight={60}
                            style={{ height: 440, width: "100%" }}
                            rowComponent={({
                                index,
                                style,
                            }: RowComponentProps) => {
                                const p = purchases[index];
                                if (!p) return null;
                                return (
                                    <div
                                        style={style}
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
                                                    setSelectedPurchaseDetails(
                                                        p,
                                                    )
                                                }
                                                className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />{" "}
                                                Details
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
                                                <Printer className="w-4 h-4" />{" "}
                                                Print
                                            </button>
                                        </div>
                                    </div>
                                );
                            }}
                            rowProps={{}}
                        />
                    ) : (
                        <div className="px-6 py-4 text-center text-gray-500">
                            No records found
                        </div>
                    )}
                </div>
                {/* Purchase Details Modal */}
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
                                        {selectedPurchaseDetails.invoice_no} |
                                        Date: {selectedPurchaseDetails.date}
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        setSelectedPurchaseDetails(null)
                                    }
                                    className="p-2 hover:bg-brand-700 rounded-full transition-colors"
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
                                            {
                                                selectedPurchaseDetails.supplier
                                                    ?.name
                                            }
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
                                                    selectedPurchaseDetails
                                                        .supplier.mobile
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
                                                {
                                                    selectedPurchaseDetails.pat_size
                                                }{" "}
                                                m
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
                                                    {selectedPurchaseDetails
                                                        .items?.length || 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Total Pieces:</span>
                                                <span className="font-bold">
                                                    {selectedPurchaseDetails.items?.reduce(
                                                        (sum, i) =>
                                                            sum +
                                                            i.pieces_round,
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
                                                                {
                                                                    item.pieces_round
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                                                                    item.status ===
                                                                    "completed"
                                                                        ? "bg-green-100 text-green-700 border border-green-200"
                                                                        : item.status ===
                                                                            "assigned"
                                                                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                                                }`}
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
                                        <Printer className="w-4 h-4" /> Print
                                        Full Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <NewSupplierModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreateSupplier}
            />
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setView("list")}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                    New Purchase Entry
                </h2>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Supplier Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Supplier
                        </label>
                        <SearchableSelect
                            options={suppliers}
                            value={supplierId}
                            onChange={setSupplierId}
                            placeholder="Select Supplier"
                            onAddNew={() => setIsModalOpen(true)}
                            addNewLabel="New Supplier"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Invoice No.
                            </label>
                            <input
                                type="text"
                                value={invoiceNo}
                                onChange={(e) => setInvoiceNo(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm border p-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Pat Size (Meters)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={patSize}
                            onChange={(e) =>
                                setPatSize(parseFloat(e.target.value))
                            }
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm border p-2"
                        />
                    </div>
                </div>

                {/* Excel-like Grid */}
                <div className="border rounded-md overflow-hidden">
                    <div className="grid grid-cols-7 bg-gray-100 p-2 text-xs font-bold text-gray-700 border-b">
                        <div className="col-span-1">S. No.</div>
                        <div className="col-span-1">Size (m)</div>
                        <div className="col-span-1">Pat (Dec)</div>
                        <div className="col-span-1">Pat (Round)</div>
                        <div className="col-span-1">Final (Dec)</div>
                        <div className="col-span-1">Final (Round)</div>
                        <div className="col-span-1">Action</div>
                    </div>
                    <div className="h-[400px]">
                        <List
                            rowCount={items.length}
                            rowHeight={50}
                            style={{ height: 400, width: "100%" }}
                            rowComponent={({
                                index,
                                style,
                            }: RowComponentProps) => {
                                const item = items[index];
                                if (!item) return null;
                                return (
                                    <div
                                        style={style}
                                        className="grid grid-cols-7 p-2 border-b items-center text-sm hover:bg-gray-50 bg-white"
                                    >
                                        <div className="col-span-1 text-gray-500 pl-2">
                                            {item.sNo}
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                type="number"
                                                className="w-24 border rounded px-2 py-1 focus:ring-1 focus:ring-brand-500 outline-none"
                                                value={item.sizeMeters || ""}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        item.id,
                                                        "sizeMeters",
                                                        parseFloat(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="col-span-1 text-gray-600">
                                            {item.patRaw.toFixed(2)}
                                        </div>
                                        <div className="col-span-1 font-medium">
                                            {item.patRound}
                                        </div>
                                        <div className="col-span-1 text-gray-600">
                                            {item.piecesRaw}
                                        </div>
                                        <div className="col-span-1 font-bold text-brand-700">
                                            {item.piecesRound}
                                        </div>
                                        <div className="col-span-1">
                                            <button
                                                onClick={() =>
                                                    removeItemRow(item.id)
                                                }
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            }}
                            rowProps={{}}
                        />
                    </div>
                </div>

                <div className="mt-4 flex gap-4">
                    <button
                        onClick={addItemRow}
                        className="flex items-center gap-2 text-brand-600 hover:text-brand-800 font-medium"
                    >
                        <FilePlus className="w-4 h-4" /> Add Row
                    </button>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button
                        onClick={() => setView("list")}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
                    >
                        <Save className="w-4 h-4" /> Save Purchase
                    </button>
                </div>
            </div>
        </div>
    );
};
