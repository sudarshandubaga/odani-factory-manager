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
    if (!order)
        return <div className="p-10 text-center">Work Order not found</div>;

    const assignedItems = order.items || [];

    return (
        <div className="min-h-screen bg-white text-black max-w-[210mm] mx-auto p-4 print:p-0">
            <div className="border-2 border-black p-8 my-4 print:my-0">
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <h1 className="text-2xl font-bold uppercase">
                        {COMPANY_NAME} - Work Order
                    </h1>
                    <p className="text-sm text-gray-600">Internal Job Sheet</p>
                </div>

                <div className="grid grid-cols-3 gap-8 mb-6 text-sm">
                    <div className="col-span-1">
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
                        {order.no_of_pieces && (
                            <p>
                                <span className="font-bold">
                                    No. of Pieces:
                                </span>{" "}
                                {order.no_of_pieces}
                            </p>
                        )}
                    </div>
                    <div className="text-center col-span-1 border-x border-gray-100 px-4">
                        {order.image_url || order.image ? (
                            <img
                                src={order.image_url || order.image || ""}
                                alt="Work Reference"
                                className="max-h-48 mx-auto rounded border border-black shadow-sm"
                            />
                        ) : (
                            <div className="h-32 flex items-center justify-center text-gray-300 italic text-xs border border-dashed border-gray-200 rounded">
                                No Image Provided
                            </div>
                        )}
                    </div>
                    <div className="text-right col-span-1">
                        <p>
                            <span className="font-bold">Worker:</span>{" "}
                            {worker?.name}
                        </p>
                        <p>
                            <span className="font-bold">Mobile:</span>{" "}
                            {worker?.mobile}
                        </p>
                        {purchase && (
                            <p>
                                <span className="font-bold">
                                    Khilai Invoice:
                                </span>{" "}
                                {purchase.invoice_no}
                            </p>
                        )}
                        {order.remarks && (
                            <p className="mt-2">
                                <span className="font-bold">Remarks:</span>{" "}
                                {order.remarks}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold text-lg mb-2">
                        Assigned Items List
                    </h3>
                    <table className="w-full border-collapse border border-black text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black px-2 py-1 w-16">
                                    Sr. No.
                                </th>
                                {!workType?.parent_id ? (
                                    <>
                                        <th className="border border-black px-2 py-1">
                                            Pat Size
                                        </th>
                                        <th className="border border-black px-2 py-1">
                                            Pat
                                        </th>
                                        {/* <th className="border border-black px-2 py-1">
                                            Final
                                        </th> */}
                                    </>
                                ) : (
                                    <>
                                        <th className="border border-black px-2 py-1">
                                            Work Order No.
                                        </th>
                                        <th className="border border-black px-2 py-1">
                                            No. of pieces
                                        </th>
                                    </>
                                )}
                                <th className="border border-black px-2 py-1 w-32">
                                    Worker Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedItems.map((item, idx) => (
                                <tr key={item.id}>
                                    <td className="border border-black px-2 py-1 text-center">
                                        {idx + 1}
                                    </td>
                                    {!workType?.parent_id ? (
                                        <>
                                            <td className="border border-black px-2 py-1 text-center font-mono">
                                                {item.size_meters} m
                                            </td>
                                            <td className="border border-black px-2 py-1 text-center">
                                                {item.pat_round}
                                            </td>
                                            {/* <td className="border border-black px-2 py-1 text-center font-bold">
                                                {item.pieces_round}
                                            </td> */}
                                        </>
                                    ) : (
                                        <>
                                            <td className="border border-black px-2 py-1 text-center font-mono">
                                                {String(order.id)
                                                    .slice(-6)
                                                    .toUpperCase()}
                                            </td>
                                            <td className="border border-black px-2 py-1 text-center font-bold">
                                                {item.pieces_round}
                                            </td>
                                        </>
                                    )}
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
                                {!workType?.parent_id ? (
                                    <>
                                        <td className="border border-black px-2 py-1 text-center">
                                            {assignedItems.reduce(
                                                (s, i) => s + i.pat_round,
                                                0,
                                            )}
                                        </td>
                                        {/* <td className="border border-black px-2 py-1 text-center">
                                            {assignedItems.reduce(
                                                (s, i) => s + i.pieces_round,
                                                0,
                                            )}
                                        </td> */}
                                    </>
                                ) : (
                                    <td className="border border-black px-2 py-1 text-center">
                                        {assignedItems.reduce(
                                            (s, i) => s + i.pieces_round,
                                            0,
                                        )}
                                    </td>
                                )}
                                <td className="border border-black px-2 py-1"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {order.status === "completed" && (
                    <div className="mt-6 border-t border-black pt-4">
                        <h3 className="font-bold text-lg mb-2">
                            Received Summary
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            {order.no_of_pieces && (
                                <div className="border border-black p-2 rounded text-center">
                                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                        Assigned Pieces
                                    </div>
                                    <div className="text-2xl font-black">
                                        {order.no_of_pieces}
                                    </div>
                                </div>
                            )}
                            <div className="border border-black p-2 rounded text-center">
                                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Completed Pieces
                                </div>
                                <div className="text-2xl font-black">
                                    {order.received_pcs ?? "—"}
                                </div>
                            </div>
                            {order.due_pcs !== null &&
                                order.due_pcs !== undefined && (
                                    <div className="border border-black p-2 rounded text-center">
                                        <div className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                            Due Pieces
                                        </div>
                                        <div className="text-2xl font-black">
                                            {order.due_pcs}
                                        </div>
                                    </div>
                                )}
                        </div>
                        {order.notes && (
                            <div className="border border-black p-2 rounded mt-3 text-sm">
                                <span className="font-bold">
                                    Completion Notes:
                                </span>{" "}
                                {order.notes}
                            </div>
                        )}
                    </div>
                )}

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
