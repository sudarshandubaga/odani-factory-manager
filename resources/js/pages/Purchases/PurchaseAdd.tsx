import React, { useState, useEffect } from "react";
import { storage } from "../../services/storage";
import { PurchaseItem, Supplier } from "../../types";
import { Trash, Save, FilePlus, ChevronLeft } from "lucide-react";
import { SearchableSelect } from "../../components/SearchableSelect";
import { NewSupplierModal } from "../../components/NewSupplierModal";

interface PurchaseAddProps {
    onCancel: () => void;
    onSuccess: () => void;
}

import { toast } from "react-hot-toast";

export const PurchaseAdd: React.FC<PurchaseAddProps> = ({
    onCancel,
    onSuccess,
}) => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [supplierId, setSupplierId] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invoiceNo, setInvoiceNo] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [patSize, setPatSize] = useState<number>(2.5);
    const [itemType, setItemType] = useState<"lot" | "pieces">("lot");
    const [totalPieces, setTotalPieces] = useState<number>(0);
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
        const fetchSuppliers = async () => {
            const data = await storage.getSuppliers();
            setSuppliers(data);
        };
        fetchSuppliers();
    }, []);

    const handleCreateSupplier = async (supplierData: Omit<Supplier, "id">) => {
        try {
            const newSup = await storage.addSupplier(supplierData);
            setSuppliers([...suppliers, newSup]);
            setSupplierId(newSup.id);
            toast.success("New supplier created and selected!");
        } catch (error) {
            toast.error("Failed to create supplier");
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
        if (!supplierId || !invoiceNo) {
            toast.error("Supplier and Invoice No. are required");
            return;
        }

        if (itemType === "lot") {
            const validItems = items.filter((i) => i.sizeMeters > 0);
            if (validItems.length === 0) {
                toast.error("Please add at least one item with size > 0");
                return;
            }

            const purchase = {
                supplier_id: supplierId,
                invoice_no: invoiceNo,
                date,
                pat_size: patSize,
                item_type: itemType,
                total_pieces: null,
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
                await storage.addPurchase(purchase);
                toast.success("Purchase record saved successfully!");
                onSuccess();
            } catch (error) {
                toast.error("Failed to save purchase");
            }
        } else {
            if (!totalPieces || totalPieces <= 0) {
                toast.error("Please enter a valid Total Pieces value");
                return;
            }

            const purchase = {
                supplier_id: supplierId,
                invoice_no: invoiceNo,
                date,
                pat_size: patSize,
                item_type: itemType,
                total_pieces: totalPieces,
                items: [],
            };

            try {
                await storage.addPurchase(purchase);
                toast.success("Purchase record saved successfully!");
                onSuccess();
            } catch (error) {
                toast.error("Failed to save purchase");
            }
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
            <NewSupplierModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreateSupplier}
            />
            <div className="flex items-center gap-4">
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                    New Khilai Entry
                </h2>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                </div>

                {itemType === "lot" ? (
                    <>
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
                                <div className="max-h-[400px] overflow-y-auto">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="grid grid-cols-7 p-2 border-b items-center text-sm hover:bg-gray-50 bg-white"
                                        >
                                            <div className="col-span-1 text-gray-500 pl-2">
                                                {item.sNo}
                                            </div>
                                            <div className="col-span-1">
                                                <input
                                                    type="number"
                                                    className="w-24 border rounded px-2 py-1 outline-none"
                                                    value={
                                                        item.sizeMeters || ""
                                                    }
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
                                    ))}
                                </div>
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
                        <Save className="w-4 h-4" /> Save Khilai
                    </button>
                </div>
            </div>
        </div>
    );
};
