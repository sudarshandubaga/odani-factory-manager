import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { storage } from "../../services/storage";
import { COMPANY_NAME, COMPANY_ADDRESS, TERMS } from "../../constants";
import { Purchase, Supplier } from "../../types";

export const PurchaseReport: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const foundPurchase = await storage.getPurchase(id);
                console.log("foundPurchase", foundPurchase);
                setPurchase(foundPurchase);

                // Supplier is already included in the response from the backend
                setSupplier(foundPurchase.supplier || null);
            } catch (error) {
                console.error("Error fetching purchase", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!purchase)
        return <div className="p-10 text-center">Purchase not found</div>;

    return (
        <div className="min-h-screen bg-white text-black p-8 max-w-[210mm] mx-auto">
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold uppercase">
                        {COMPANY_NAME}
                    </h1>
                    <p className="text-sm mt-1 max-w-sm whitespace-pre-wrap">
                        {COMPANY_ADDRESS}
                    </p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-gray-500">
                        Purchase Report
                    </h2>
                    <div className="mt-2 text-sm">
                        <p>
                            <span className="font-bold">Date:</span>{" "}
                            {purchase.date}
                        </p>
                        <p>
                            <span className="font-bold">Invoice No:</span>{" "}
                            {purchase.invoice_no}
                        </p>
                        <p>
                            <span className="font-bold">Pat Size:</span>{" "}
                            {purchase.pat_size} m
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-bold text-lg border-b border-gray-300 inline-block mb-2">
                    Supplier Details
                </h3>
                <p className="text-lg">{supplier?.name}</p>
            </div>

            <table className="w-full border-collapse border border-black mb-8">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black px-2 py-1 text-center w-16">
                            Sr. No.
                        </th>
                        <th className="border border-black px-2 py-1 text-center">
                            Size (Meters)
                        </th>
                        <th className="border border-black px-2 py-1 text-center">
                            Round-off Pat
                        </th>
                        <th className="border border-black px-2 py-1 text-center">
                            Final Pieces
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {/* Map Items */}
                    {(purchase.items || []).map((item) => (
                        <tr key={item.id}>
                            <td className="border border-black px-2 py-1 text-center">
                                {item.s_no}
                            </td>
                            <td className="border border-black px-2 py-1 text-center">
                                {item.size_meters}
                            </td>
                            <td className="border border-black px-2 py-1 text-center">
                                {item.pat_round}
                            </td>
                            <td className="border border-black px-2 py-1 text-center font-bold">
                                {item.pieces_round}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-gray-100 font-bold">
                        <td
                            className="border border-black px-2 py-1 text-center"
                            colSpan={2}
                        >
                            Total
                        </td>
                        <td className="border border-black px-2 py-1 text-center">
                            {(purchase.items || []).reduce(
                                (s, i) => s + i.pat_round,
                                0,
                            )}
                        </td>
                        <td className="border border-black px-2 py-1 text-center">
                            {(purchase.items || []).reduce(
                                (s, i) => s + i.pieces_round,
                                0,
                            )}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div className="grid grid-cols-2 gap-8 mt-12">
                <div>
                    <h4 className="font-bold underline mb-2">
                        Terms & Conditions
                    </h4>
                    <ul className="list-decimal list-inside text-xs space-y-1">
                        {TERMS.map((t, i) => (
                            <li key={i}>{t}</li>
                        ))}
                    </ul>
                </div>
                <div className="flex flex-col justify-end items-end text-center">
                    <div className="h-16 w-32 border-b border-black mb-2"></div>
                    <p className="font-bold text-sm">Authorized Signatory</p>
                </div>
            </div>

            <div className="no-print mt-10 text-center">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
                >
                    Print Report
                </button>
            </div>
        </div>
    );
};
