import React, { useState, useEffect } from "react";
import { X, Save, Upload, Calculator } from "lucide-react";
import { toast } from "react-hot-toast";
import { formatNumber } from "../utils";
import { storage } from "../services/storage";
import { Purchase, WorkOrder } from "../types";

interface NewVoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (voucherData: any) => void;
    initialData?: {
        type: "khilai" | "work-order";
        id: string;
        totalDue: number;
        description?: string;
        workType?: string;
        editId?: string;
        totalReceived?: number;
        date?: string;
        image?: string;
    };
}

export const NewVoucherModal: React.FC<NewVoucherModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
}) => {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [totalReceived, setTotalReceived] = useState<number>(0);
    const [totalDue, setTotalDue] = useState<number>(
        initialData?.totalDue || 0,
    );
    const [balance, setBalance] = useState<number>(initialData?.totalDue || 0);
    const [description, setDescription] = useState(
        initialData?.description || "",
    );
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTotalDue(Number(initialData.totalDue || 0));
            setTotalReceived(Number(initialData.totalReceived || 0));
            setDate(initialData.date || new Date().toISOString().split("T")[0]);
            setBalance(Number(initialData.totalDue || 0) - Number(initialData.totalReceived || 0));
            setDescription(initialData.description || "");
            if (initialData.image) {
                setImagePreview(`/storage/${initialData.image}`);
            } else {
                setImagePreview(null);
            }
        } else {
            setTotalReceived(0);
            setImagePreview(null);
            setImage(null);
        }
    }, [initialData, isOpen]);

    useEffect(() => {
        setBalance(totalDue - totalReceived);
    }, [totalReceived, totalDue]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!totalReceived && totalReceived !== 0) {
            toast.error("Please enter received pieces");
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("date", date);
            formData.append("type", initialData?.type || "khilai");
            if (initialData?.type === "khilai") {
                formData.append("khilai_id", initialData.id);
            } else if (initialData?.type === "work-order") {
                formData.append("work_order_id", initialData.id);
            }
            formData.append("total_received", totalReceived.toString());
            formData.append("total_due", totalDue.toString());
            formData.append("balance", balance.toString());
            formData.append("description", description);
            if (image) {
                formData.append("image", image);
            }

            let res;
            if (initialData?.editId) {
                res = await storage.updateVoucher(initialData.editId, formData);
                toast.success("Voucher updated successfully!");
            } else {
                res = await storage.addVoucher(formData);
                toast.success("Voucher created successfully!");
            }
            onSave(res);
            onClose();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to save voucher",
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-brand-600 text-white">
                    <h3 className="text-xl font-bold">
                        {initialData?.editId ? "Edit" : "Create"} Voucher
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-brand-700 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {initialData?.workType && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                                Work Type
                            </label>
                            <span className="text-sm font-bold text-blue-700">
                                {initialData.workType}
                            </span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-brand-500 focus:border-brand-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total Due (Pcs)
                            </label>
                            <input
                                type="number"
                                value={totalDue}
                                readOnly
                                className="w-full bg-gray-50 border-gray-200 rounded-lg shadow-sm border p-2.5 text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 font-bold text-brand-600">
                                Received (Pcs)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={totalReceived}
                                onChange={(e) =>
                                    setTotalReceived(
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                className="w-full border-brand-300 rounded-lg shadow-sm border p-2.5 focus:ring-brand-500 focus:border-brand-500 font-bold text-lg"
                                autoFocus={!initialData?.editId}
                            />
                        </div>
                    </div>

                    <div className="bg-brand-50 p-3 rounded-lg border border-brand-100 flex justify-between items-center">
                        <span className="text-sm font-medium text-brand-700">
                            Remaining Balance:
                        </span>
                        <span
                            className={`text-lg font-black ${balance > 0 ? "text-amber-600" : "text-emerald-600"}`}
                        >
                            {formatNumber(balance)} pcs
                        </span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-brand-500 focus:border-brand-500 resize-none text-sm"
                            placeholder="Add notes..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Attachment / Receipt
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 hover:bg-gray-50 cursor-pointer transition-colors group">
                                <Upload className="w-6 h-6 text-gray-400 group-hover:text-brand-500 mb-1" />
                                <span className="text-xs text-gray-500 group-hover:text-brand-600">
                                    {imagePreview
                                        ? "Change Receipt"
                                        : "Upload Receipt"}
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                            {imagePreview && (
                                <div className="h-20 w-20 border rounded-lg overflow-hidden bg-gray-50 relative">
                                    <img
                                        src={imagePreview}
                                        className="h-full w-full object-cover"
                                        alt="Preview"
                                    />
                                    <button
                                        onClick={() => {
                                            setImage(null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
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
                        className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving
                            ? "Saving..."
                            : initialData?.editId
                              ? "Update Voucher"
                              : "Create Voucher"}
                    </button>
                </div>
            </div>
        </div>
    );
};
