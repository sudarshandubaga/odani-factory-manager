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

    return (
        <div className="min-h-screen bg-white text-black max-w-[210mm] mx-auto p-4 print:p-0">
            <div className="border-2 border-black p-8 my-4 print:my-0">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold uppercase">
                        {COMPANY_NAME} - Work Order
                    </h1>
                    <p className="text-sm text-gray-100 bg-gray-950 uppercase font-bold py-2 mt-2">
                        {getFullWorkName()} Job Sheet
                    </p>
                </div>

                <div className="grid grid-cols-4 gap-8 mb-6 text-sm">
                    <div className="col-span-1">
                        <p>
                            <span className="font-bold">Worker:</span>
                            {worker?.name}
                        </p>
                        <p>
                            <span className="font-bold">Mobile:</span>
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
                    <div className="text-right col-span-2">
                        <p className="text-3xl font-bold">
                            #{String(order.id).slice(-6).padStart(4, "0")}
                        </p>
                        <table className="w-full border">
                            <tr>
                                <th className="border border-black p-2">
                                    Assigned Date:
                                </th>
                                <td className="border border-black p-2">
                                    {new Date(
                                        order.created_at,
                                    ).toLocaleDateString()}
                                </td>
                            </tr>
                            <tr>
                                <th className="border border-black p-2">
                                    Deadline:
                                </th>
                                <td className="border border-black p-2">
                                    {order.deadline}
                                </td>
                            </tr>
                        </table>

                        {/* {order.no_of_pieces && (
                            <p>
                                <span className="font-bold">
                                    No. of Pieces:
                                </span>{" "}
                                {order.no_of_pieces}
                            </p>
                        )} */}
                    </div>
                </div>

                <div className="mt-6 pt-4">
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
                        <div className="border border-black p-2 rounded text-center bg-gray-50">
                            <div className="text-xs text-brand-600 uppercase font-semibold mb-1">
                                Completed (VCH)
                            </div>
                            <div className="text-2xl font-black">
                                {order.vouchers?.reduce(
                                    (sum, v) => sum + Number(v.total_received),
                                    0,
                                ) || 0}
                            </div>
                        </div>
                        <div className="border border-black p-2 rounded text-center">
                            <div className="text-xs text-red-500 uppercase font-semibold mb-1">
                                Balance Due
                            </div>
                            <div className="text-2xl font-black text-red-600">
                                {Math.max(
                                    0,
                                    (order.no_of_pieces || 0) -
                                        (order.vouchers?.reduce(
                                            (sum, v) =>
                                                sum + Number(v.total_received),
                                            0,
                                        ) || 0),
                                )}
                            </div>
                        </div>
                    </div>

                    {order.vouchers && order.vouchers.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-bold text-xs uppercase tracking-widest mb-2 border-b border-black inline-block">
                                Voucher History
                            </h4>
                            <table className="w-full border-collapse border border-black text-xs">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-black p-1 text-left">
                                            Date
                                        </th>
                                        <th className="border border-black p-1 text-left">
                                            Voucher No
                                        </th>
                                        <th className="border border-black p-1 text-right">
                                            Received
                                        </th>
                                        <th className="border border-black p-1 text-right">
                                            Balance
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.vouchers.map((v) => (
                                        <tr key={v.id}>
                                            <td className="border border-black p-1">
                                                {v.date}
                                            </td>
                                            <td className="border border-black p-1">
                                                {v.voucher_no}
                                            </td>
                                            <td className="border border-black p-1 text-right font-bold">
                                                {v.total_received}
                                            </td>
                                            <td className="border border-black p-1 text-right">
                                                {v.balance}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {(order as any).paymentVouchers &&
                        (order as any).paymentVouchers.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-bold text-xs uppercase tracking-widest mb-2 border-b border-black inline-block">
                                    Payment History
                                </h4>
                                <table className="w-full border-collapse border border-black text-xs">
                                    <thead className="bg-blue-50">
                                        <tr>
                                            <th className="border border-black p-1 text-left">
                                                Date
                                            </th>
                                            <th className="border border-black p-1 text-left">
                                                Voucher No
                                            </th>
                                            <th className="border border-black p-1 text-right">
                                                Amount Paid
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(order as any).paymentVouchers.map(
                                            (v: any) => (
                                                <tr key={v.id}>
                                                    <td className="border border-black p-1">
                                                        {v.date}
                                                    </td>
                                                    <td className="border border-black p-1">
                                                        {v.voucher_no}
                                                    </td>
                                                    <td className="border border-black p-1 text-right font-bold text-blue-700">
                                                        ₹{v.price}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    {order.notes && (
                        <div className="border border-black p-2 rounded mt-3 text-sm">
                            <span className="font-bold">Completion Notes:</span>{" "}
                            {order.notes}
                        </div>
                    )}
                    {order.remarks && (
                        <p className="mt-2">
                            <span className="font-bold">Remarks:</span>{" "}
                            {order.remarks}
                        </p>
                    )}
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
