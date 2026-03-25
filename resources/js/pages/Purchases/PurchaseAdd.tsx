import React, { useState, useEffect } from "react";
import { storage } from "../../services/storage";
import { PurchaseItem, Worker } from "../../types";
import { Trash, Save, FilePlus, ChevronLeft } from "lucide-react";
import { SearchableSelect } from "../../components/SearchableSelect";
import { NewWorkerModal } from "../../components/NewWorkerModal";
import { formatNumber } from "../../utils";

interface PurchaseAddProps {
    onCancel: () => void;
    onSuccess: () => void;
    editId?: string;
}

import { toast } from "react-hot-toast";

export const PurchaseAdd: React.FC<PurchaseAddProps> = ({
    onCancel,
    onSuccess,
    editId,
}) => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [workerId, setWorkerId] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invoiceNo, setInvoiceNo] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [patSize, setPatSize] = useState<number>(2.5);
    const [itemType, setItemType] = useState<"lot" | "pieces">("lot");
    const [totalPieces, setTotalPieces] = useState<number>(0);
    const [pricePerPc, setPricePerPc] = useState<number>(0);
    const [isEditing, setIsEditing] = useState(false);
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
            const data = await storage.getWorkers();
            setWorkers(data);

            if (editId) {
                setIsEditing(true);
                const purchase = await storage.getPurchase(editId);
                setWorkerId(String(purchase.worker_id));
                setInvoiceNo(purchase.invoice_no);
                setDate(purchase.date);
                setPatSize(Number(purchase.pat_size));
                setItemType(purchase.item_type as "lot" | "pieces");
                setTotalPieces(Number(purchase.total_pieces));
                setPricePerPc(Number(purchase.price_per_pc || 0));

                if (purchase.item_type === "lot" && purchase.items) {
                    setItems(
                        purchase.items.map((i: any) => ({
                            id: String(i.id),
                            sNo: i.s_no,
                            sizeMeters: Number(i.size_meters),
                            patRaw: Number(i.pat_raw),
                            patRound: Number(i.pat_round),
                            piecesRaw: Number(i.pieces_raw),
                            piecesRound: Number(i.pieces_round),
                            status: i.status || "pending",
                        })),
                    );
                }
            }
        };
        fetchData();
    }, [editId]);

    const handleCreateWorker = async (workerData: Omit<Worker, "id">) => {
        try {
            const newWorker = await storage.addWorker(workerData);
            setWorkers([...workers, newWorker]);
            setWorkerId(newWorker.id);
            toast.success("New worker created and selected!");
        } catch (error) {
            toast.error("Failed to create worker");
        }
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
        if (!workerId || !invoiceNo) {
            toast.error("Worker and Invoice No. are required");
            return;
        }

        const validItems =
            itemType === "lot" ? items.filter((i) => i.sizeMeters > 0) : [];
        if (itemType === "lot" && validItems.length === 0) {
            toast.error("Please add at least one item with size > 0");
            return;
        }

        if (itemType === "pieces" && (!totalPieces || totalPieces <= 0)) {
            toast.error("Please enter a valid Total Pieces value");
            return;
        }

        const purchaseData = {
            worker_id: workerId,
            invoice_no: invoiceNo,
            date,
            pat_size: patSize,
            item_type: itemType,
            total_pieces: itemType === "pieces" ? totalPieces : null,
            price_per_pc: pricePerPc,
            items: validItems.map((i) => ({
                s_no: i.sNo,
                size_meters: i.sizeMeters,
                pat_raw: i.patRaw,
                pat_round: i.patRound,
                pieces_raw: i.piecesRaw,
                pieces_round: i.piecesRound,
            })),
        };

        try {
            if (editId) {
                await storage.updatePurchase(editId, purchaseData);
                toast.success("Purchase record updated successfully!");
            } else {
                await storage.addPurchase(purchaseData);
                toast.success("Purchase record saved successfully!");
            }
            onSuccess();
        } catch (error) {
            toast.error("Failed to save purchase");
        }
    };

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

    return (
        <div className="space-y-6">
            <NewWorkerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreateWorker}
            />
            <div className="flex items-center gap-4">
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                    {isEditing ? "Edit Khilai Entry" : "New Khilai Entry"}
                </h2>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Worker
                        </label>
                        <SearchableSelect
                            options={workers}
                            value={workerId}
                            onChange={setWorkerId}
                            placeholder="Select Worker"
                            onAddNew={() => setIsModalOpen(true)}
                            addNewLabel="New Worker"
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
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
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
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
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
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Item Type
                        </label>
                        <div className="mt-1 flex rounded-md overflow-hidden border border-gray-300 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setItemType("lot")}
                                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                                    itemType === "lot"
                                        ? "bg-brand-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                Lot
                            </button>
                            <button
                                type="button"
                                onClick={() => setItemType("pieces")}
                                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                                    itemType === "pieces"
                                        ? "bg-brand-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                Pieces
                            </button>
                        </div>
                    </div>

                    {itemType === "pieces" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Total Pieces
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={totalPieces || ""}
                                onChange={(e) =>
                                    setTotalPieces(
                                        parseInt(e.target.value) || 0,
                                    )
                                }
                                placeholder="Enter total pieces"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Price per Pc (₹)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={pricePerPc || ""}
                            onChange={(e) =>
                                setPricePerPc(parseFloat(e.target.value) || 0)
                            }
                            placeholder="0.00"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2 font-bold text-brand-700"
                        />
                    </div>
                </div>

                {itemType === "lot" ? (
                    <>
                        <div className="border rounded-md overflow-hidden max-h-[500px] overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                    <tr className="text-xs font-bold text-gray-700 border-b">
                                        <th className="px-4 py-2 border-r">S. No.</th>
                                        <th className="px-4 py-2">Size (m)</th>
                                        <th className="px-4 py-2">Pat (Dec)</th>
                                        <th className="px-4 py-2">Pat (Round)</th>
                                        <th className="px-4 py-2">Final (Dec)</th>
                                        <th className="px-4 py-2">Final (Round)</th>
                                        <th className="px-4 py-2 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b text-sm hover:bg-gray-50 bg-white group"
                                        >
                                            <td className="px-4 py-2 text-gray-500 border-r font-mono">
                                                {item.sNo}
                                            </td>
                                            <td className="px-4 py-1">
                                                <input
                                                    type="number"
                                                    className="w-24 border border-gray-200 rounded px-2 py-1 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                                                    value={item.sizeMeters || ""}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            item.id,
                                                            "sizeMeters",
                                                            parseFloat(e.target.value) || 0
                                                        )
                                                    }
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-gray-400">
                                                {formatNumber(item.patRaw)}
                                            </td>
                                            <td className="px-4 py-2 font-medium text-gray-700">
                                                {formatNumber(item.patRound)}
                                            </td>
                                            <td className="px-4 py-2 text-gray-400">
                                                {formatNumber(item.piecesRaw)}
                                            </td>
                                            <td className="px-4 py-2 font-bold text-brand-700">
                                                {formatNumber(item.piecesRound)}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    onClick={() => removeItemRow(item.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Remove Row"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex gap-4">
                            <button
                                onClick={addItemRow}
                                className="flex items-center gap-2 text-brand-600 hover:text-brand-800 font-medium"
                            >
                                <FilePlus className="w-4 h-4" /> Add Row
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="border rounded-md p-6 bg-gray-50 flex flex-col items-center justify-center gap-3">
                        <p className="text-sm text-gray-500 font-medium">
                            Total Pieces for this purchase
                        </p>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                min="0"
                                value={totalPieces || ""}
                                onChange={(e) =>
                                    setTotalPieces(
                                        parseInt(e.target.value) || 0,
                                    )
                                }
                                placeholder="Enter total pieces"
                                className="w-48 border-gray-300 rounded-md shadow-sm border p-3 text-center text-xl font-bold outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <span className="text-gray-500 text-sm">
                                pieces
                            </span>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
                    >
                        <Save className="w-4 h-4" />{" "}
                        {isEditing ? "Update Khilai" : "Save Khilai"}
                    </button>
                </div>
            </div>
        </div>
    );
};
