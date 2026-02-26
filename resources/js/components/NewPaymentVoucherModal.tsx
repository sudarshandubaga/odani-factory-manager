import React, { useState, useEffect } from "react";
import { X, Save, Upload, Calculator, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import { storage } from "../services/storage";

interface NewPaymentVoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (voucherData: any) => void;
    initialData?: {
        type: "khilai" | "work-order";
        id: string;
        totalDue: number;
        description?: string;
        editId?: string;
        price?: number;
        date?: string;
    };
}

export const NewPaymentVoucherModal: React.FC<NewPaymentVoucherModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
}) => {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [price, setPrice] = useState<number>(0);
    const [totalDue, setTotalDue] = useState<number>(
        initialData?.totalDue || 0,
    );
    const [description, setDescription] = useState(
        initialData?.description || "",
    );
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTotalDue(initialData.totalDue);
            setPrice(initialData.price || 0);
            setDate(initialData.date || new Date().toISOString().split("T")[0]);
            setDescription(initialData.description || "");
        } else {
            setPrice(0);
        }
    }, [initialData, isOpen]);

    const handleSave = async () => {
        if (!price && price !== 0) {
            toast.error("Please enter price/amount");
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("date", date);
            formData.append("type", initialData?.type || "khilai");
            if (initialData?.type === "khilai") {
                formData.append("khilai_id", String(initialData.id));
            } else if (initialData?.type === "work-order") {
                formData.append("work_order_id", String(initialData.id));
            }
            formData.append("price", String(price));
            formData.append("total_due", String(totalDue));
            if (description) formData.append("description", description);

            let res;
            if (initialData?.editId) {
                res = await storage.updatePaymentVoucher(
                    initialData.editId,
                    formData,
                );
                toast.success("Payment Voucher updated successfully!");
            } else {
                res = await storage.addPaymentVoucher(formData);
                toast.success("Payment Voucher created successfully!");
            }
            onSave(res);
            onClose();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to save payment voucher",
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white">
                    <h3 className="text-xl font-bold">
                        {initialData?.editId ? "Edit" : "Create"} Payment
                        Voucher
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-blue-700 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total Due Amount (₹)
                            </label>
                            <input
                                type="number"
                                value={totalDue}
                                onChange={(e) =>
                                    setTotalDue(parseFloat(e.target.value) || 0)
                                }
                                className="w-full bg-white border-gray-300 rounded-lg shadow-sm border p-2.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 font-bold text-blue-600">
                                Enter Amount (₹)
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) =>
                                    setPrice(parseFloat(e.target.value) || 0)
                                }
                                className="w-full border-blue-300 rounded-lg shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500 font-bold text-lg"
                                autoFocus={!initialData?.editId}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description / Notes
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                            placeholder="Add notes..."
                        />
                    </div>

                    <div className="p-4 bg-gray-50 border-t flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving
                                ? "Saving..."
                                : initialData?.editId
                                  ? "Update Payment"
                                  : "Save Payment"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
