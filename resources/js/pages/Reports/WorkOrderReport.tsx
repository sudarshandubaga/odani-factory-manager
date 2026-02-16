import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { storage } from "../../services/storage";
import { COMPANY_NAME } from "../../constants";
import { WorkOrder, Purchase, Worker, WorkType } from "../../types";

export const WorkOrderReport: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<WorkOrder | null>(null);
    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [worker, setWorker] = useState<Worker | null>(null);
    const [workType, setWorkType] = useState<WorkType | null>(null);
    const [allWorkTypes, setAllWorkTypes] = useState<WorkType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const foundOrder = await storage
                    .getWorkOrders()
                    .then((orders) => orders.find((o) => o.id == id));
                if (foundOrder) {
                    setOrder(foundOrder);
                    const [purchases, workers, types] = await Promise.all([
                        storage.getPurchases(),
                        storage.getWorkers(),
                        storage.getWorkTypes(),
                    ]);
                    setAllWorkTypes(types);
                    setPurchase(
                        purchases.find((p) => p.id == foundOrder.purchase_id) ||
                            null,
                    );
                    setWorker(
                        workers.find((w) => w.id == foundOrder.worker_id) ||
                            null,
                    );
                    const wt =
                        types.find((wt) => wt.id == foundOrder.work_type_id) ||
                        null;
                    setWorkType(wt);
                }
            } catch (error) {
                console.error("Error fetching report data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const getFullWorkName = () => {
        if (!workType) return "Unknown";
        const parent = allWorkTypes.find((t) => t.id === workType.parent_id);
        return parent ? `${parent.name} > ${workType.name}` : workType.name;
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!order || !purchase)
        return <div className="p-10 text-center">Work Order not found</div>;

    const assignedItems = order.items || [];

    return (
        <div className="min-h-screen bg-white text-black p-8 max-w-[210mm] mx-auto">
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase">
                    {COMPANY_NAME} - Work Order
                </h1>
                <p className="text-sm text-gray-600">Internal Job Sheet</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
                <div>
                    <p>
                        <span className="font-bold">Order ID:</span>{" "}
                        {String(order.id).slice(-6).toUpperCase()}
                    </p>
                    <p>
                        <span className="font-bold">Assigned Date:</span>{" "}
                        {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p>
                        <span className="font-bold">Deadline:</span>{" "}
                        {order.deadline}
                    </p>
                    <p>
                        <span className="font-bold">Work Type:</span>{" "}
                        {getFullWorkName()}
                    </p>
                </div>
                <div className="text-right">
                    <p>
                        <span className="font-bold">Worker:</span>{" "}
                        {worker?.name}
                    </p>
                    <p>
                        <span className="font-bold">Mobile:</span>{" "}
                        {worker?.mobile}
                    </p>
                    <p>
                        <span className="font-bold">Source Invoice:</span>{" "}
                        {purchase.invoice_no}
                    </p>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="font-bold text-lg mb-2">Assigned Items List</h3>
                <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-1 w-16">
                                Sr. No.
                            </th>
                            <th className="border border-black px-2 py-1">
                                Size (Meters)
                            </th>
                            <th className="border border-black px-2 py-1">
                                Pieces
                            </th>
                            <th className="border border-black px-2 py-1 w-32">
                                Worker Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignedItems.map((item, idx) => (
                            <tr key={item.id}>
                                <td className="border border-black px-2 py-1 text-center">
                                    {item.s_no}
                                </td>
                                <td className="border border-black px-2 py-1 text-center">
                                    {item.size_meters}
                                </td>
                                <td className="border border-black px-2 py-1 text-center font-bold">
                                    {item.pieces_round}
                                </td>
                                <td className="border border-black px-2 py-1"></td>
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
                                {assignedItems.reduce(
                                    (s, i) => s + i.pieces_round,
                                    0,
                                )}
                            </td>
                            <td className="border border-black px-2 py-1"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="mt-12 flex justify-between items-end">
                <div className="text-center">
                    <div className="border-b border-black w-32 mb-1"></div>
                    <p className="text-xs">Manager Sign</p>
                </div>
                <div className="text-center">
                    <div className="border-b border-black w-32 mb-1"></div>
                    <p className="text-xs">Worker Sign</p>
                </div>
            </div>

            <div className="no-print mt-10 text-center">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
                >
                    Print Work Order
                </button>
            </div>
        </div>
    );
};
