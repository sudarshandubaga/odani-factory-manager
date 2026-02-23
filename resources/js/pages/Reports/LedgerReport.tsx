import React, { useState, useEffect } from "react";
import { storage } from "../../services/storage";
import { COMPANY_NAME } from "../../constants";
import { Purchase, WorkOrder, Worker } from "../../types";
import { Printer } from "lucide-react";

export const LedgerReport: React.FC = () => {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedWorkerId, setSelectedWorkerId] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [p, wo, w] = await Promise.all([
                    storage.getPurchases(),
                    storage.getWorkOrders(),
                    storage.getWorkers(),
                ]);
                setPurchases(p);
                setWorkOrders(wo);
                setWorkers(w);
            } catch (e) {
                console.error("Error fetching ledger data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getWorkerName = (id: any) =>
        workers.find((w) => w.id == id)?.name || "Unknown";

    const filteredOrders = workOrders.filter((o) => {
        const date = o.created_at?.split("T")[0];
        if (fromDate && date < fromDate) return false;
        if (toDate && date > toDate) return false;
        if (selectedWorkerId && String(o.worker_id) !== selectedWorkerId)
            return false;
        if (selectedStatus !== "all" && o.status !== selectedStatus)
            return false;
        return true;
    });

    const completedOrders = filteredOrders.filter(
        (o) => o.status === "completed",
    );
    const activeOrders = filteredOrders.filter((o) => o.status === "active");

    const totalAssigned = filteredOrders.reduce(
        (s, o) => s + (o.no_of_pieces || 0),
        0,
    );
    const totalCompleted = completedOrders.reduce(
        (s, o) => s + (o.received_pcs || 0),
        0,
    );
    const totalDue = completedOrders.reduce((s, o) => s + (o.due_pcs || 0), 0);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-end gap-4 no-print">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        From Date
                    </label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        To Date
                    </label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        Worker
                    </label>
                    <select
                        value={selectedWorkerId}
                        onChange={(e) => setSelectedWorkerId(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500 w-48"
                    >
                        <option value="">All Workers</option>
                        {workers.map((w) => (
                            <option key={w.id} value={w.id}>
                                {w.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        Status
                    </label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <button
                    onClick={() => {
                        setFromDate("");
                        setToDate("");
                        setSelectedWorkerId("");
                        setSelectedStatus("all");
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                    Clear
                </button>
                <button
                    onClick={() => window.print()}
                    className="ml-auto flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
                >
                    <Printer className="w-4 h-4" /> Print
                </button>
            </div>

            {/* Printable Report */}
            <div className="min-h-screen bg-white text-black max-w-[210mm] mx-auto p-6 print:p-0 print:max-w-none">
                {/* Header */}
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <h1 className="text-2xl font-bold uppercase">
                        {COMPANY_NAME}
                    </h1>
                    <h2 className="text-lg font-semibold mt-1">
                        Ledger Report
                    </h2>
                    {(fromDate || toDate) && (
                        <p className="text-sm text-gray-500 mt-1">
                            {fromDate && `From: ${fromDate}`}
                            {fromDate && toDate && " — "}
                            {toDate && `To: ${toDate}`}
                        </p>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4 mb-8 text-center text-sm">
                    <div className="border-2 border-black p-3 rounded">
                        <div className="text-xs uppercase font-bold text-gray-500 mb-1">
                            Total Orders
                        </div>
                        <div className="text-2xl font-black">
                            {filteredOrders.length}
                        </div>
                    </div>
                    <div className="border-2 border-black p-3 rounded">
                        <div className="text-xs uppercase font-bold text-gray-500 mb-1">
                            Total Assigned
                        </div>
                        <div className="text-2xl font-black">
                            {totalAssigned}
                        </div>
                    </div>
                    <div className="border-2 border-green-700 bg-green-50 p-3 rounded">
                        <div className="text-xs uppercase font-bold text-green-700 mb-1">
                            Completed
                        </div>
                        <div className="text-2xl font-black text-green-800">
                            {totalCompleted}
                        </div>
                    </div>
                    <div className="border-2 border-red-600 bg-red-50 p-3 rounded">
                        <div className="text-xs uppercase font-bold text-red-600 mb-1">
                            Due Pieces
                        </div>
                        <div className="text-2xl font-black text-red-700">
                            {totalDue}
                        </div>
                    </div>
                </div>

                {/* Work Orders Table */}
                <table className="w-full border-collapse border border-black text-sm mb-8">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-1 text-left">
                                Order ID
                            </th>
                            <th className="border border-black px-2 py-1 text-left">
                                Date
                            </th>
                            <th className="border border-black px-2 py-1 text-left">
                                Worker
                            </th>
                            <th className="border border-black px-2 py-1 text-center">
                                Deadline
                            </th>
                            <th className="border border-black px-2 py-1 text-center">
                                Assigned
                            </th>
                            <th className="border border-black px-2 py-1 text-center">
                                Completed
                            </th>
                            <th className="border border-black px-2 py-1 text-center">
                                Due
                            </th>
                            <th className="border border-black px-2 py-1 text-center">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr
                                key={order.id}
                                className={
                                    order.status === "completed"
                                        ? "bg-green-50"
                                        : ""
                                }
                            >
                                <td className="border border-black px-2 py-1 font-mono text-xs">
                                    #{String(order.id).slice(-6).toUpperCase()}
                                </td>
                                <td className="border border-black px-2 py-1 text-xs">
                                    {order.created_at?.split("T")[0]}
                                </td>
                                <td className="border border-black px-2 py-1">
                                    {getWorkerName(order.worker_id)}
                                </td>
                                <td className="border border-black px-2 py-1 text-center">
                                    {order.deadline}
                                </td>
                                <td className="border border-black px-2 py-1 text-center font-bold">
                                    {order.no_of_pieces ?? "—"}
                                </td>
                                <td className="border border-black px-2 py-1 text-center text-green-700 font-bold">
                                    {order.status === "completed"
                                        ? (order.received_pcs ?? "—")
                                        : "—"}
                                </td>
                                <td className="border border-black px-2 py-1 text-center text-red-600 font-bold">
                                    {order.status === "completed"
                                        ? (order.due_pcs ?? "0")
                                        : "—"}
                                </td>
                                <td className="border border-black px-2 py-1 text-center">
                                    <span
                                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${order.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                                    >
                                        {order.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredOrders.length === 0 && (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="border border-black px-2 py-4 text-center text-gray-400 italic"
                                >
                                    No work orders found for the selected
                                    period.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100 font-bold">
                            <td
                                colSpan={4}
                                className="border border-black px-2 py-1 text-right uppercase text-xs tracking-wider"
                            >
                                Totals
                            </td>
                            <td className="border border-black px-2 py-1 text-center">
                                {totalAssigned}
                            </td>
                            <td className="border border-black px-2 py-1 text-center text-green-700">
                                {totalCompleted}
                            </td>
                            <td className="border border-black px-2 py-1 text-center text-red-600">
                                {totalDue}
                            </td>
                            <td className="border border-black px-2 py-1"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};
