import React, { useState, useEffect } from "react";
import { storage } from "../../services/storage";
import { WorkOrder, Purchase, Worker, WorkType } from "../../types";
import { COMPANY_NAME } from "../../constants";

export const OverdueWorkOrdersReport: React.FC = () => {
    const [orders, setOrders] = useState<WorkOrder[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [o, w, wt, p] = await Promise.all([
                storage.getWorkOrders(),
                storage.getWorkers(),
                storage.getWorkTypes(),
                storage.getPurchases(),
            ]);

            // Filter Overdue
            const today = new Date().toISOString().split("T")[0];
            const overdue = o.filter(
                (order) => order.status === "active" && order.deadline < today,
            );

            setOrders(overdue);
            setWorkers(w);
            setWorkTypes(wt);
            setPurchases(p);
            setLoading(false);
        };
        fetchData();
    }, []);

    const getWorkerName = (id: string) =>
        workers.find((w) => w.id == id)?.name || "Unknown";
    const getWorkName = (id: string) =>
        workTypes.find((w) => w.id == id)?.name || "Unknown";
    const getPurchaseInfo = (id: string) => {
        const p = purchases.find((x) => x.id == id);
        return p ? `Inv #${p.invoice_no}` : "Unknown";
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-white text-black max-w-[210mm] mx-auto p-4 print:p-0">
            <div className="border-2 border-black p-8 my-4 print:my-0">
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <h1 className="text-2xl font-bold uppercase">
                        {COMPANY_NAME}
                    </h1>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-red-600">
                        Overdue Work Orders Report
                    </h2>
                    <p className="text-sm text-gray-600">
                        Generated on {new Date().toLocaleDateString()}
                    </p>
                </div>

                <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-1 text-center w-12">
                                Image
                            </th>
                            <th className="border border-black px-2 py-1 text-left">
                                Order ID
                            </th>
                            <th className="border border-black px-2 py-1 text-left">
                                Worker
                            </th>
                            <th className="border border-black px-2 py-1 text-left">
                                Work Type
                            </th>
                            <th className="border border-black px-2 py-1 text-left">
                                Source
                            </th>
                            <th className="border border-black px-2 py-1 text-center">
                                Deadline
                            </th>
                            <th className="border border-black px-2 py-1 text-center">
                                Items
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="border border-black px-2 py-10 text-center text-gray-500"
                                >
                                    No overdue work orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="border border-black px-2 py-1 text-center">
                                        {(order.image_url || order.image) && (
                                            <img
                                                src={
                                                    order.image_url ||
                                                    order.image ||
                                                    ""
                                                }
                                                alt="WO"
                                                className="w-10 h-10 object-cover mx-auto rounded border border-gray-200"
                                            />
                                        )}
                                    </td>
                                    <td className="border border-black px-2 py-1 font-mono">
                                        {String(order.id)
                                            .slice(-6)
                                            .toUpperCase()}
                                    </td>
                                    <td className="border border-black px-2 py-1">
                                        {getWorkerName(order.worker_id)}
                                    </td>
                                    <td className="border border-black px-2 py-1">
                                        {getWorkName(order.work_type_id)}
                                    </td>
                                    <td className="border border-black px-2 py-1">
                                        {getPurchaseInfo(order.purchase_id)}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-center text-red-600 font-bold">
                                        {order.deadline}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-center">
                                        {order.items?.length || 0}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="no-print mt-10 text-center">
                <button
                    onClick={() => window.print()}
                    className="bg-brand-600 text-white px-6 py-2 rounded shadow hover:bg-brand-700"
                >
                    Print Report
                </button>
            </div>
        </div>
    );
};
