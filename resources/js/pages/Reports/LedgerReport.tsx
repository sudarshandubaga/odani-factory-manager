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

    // 1. Combine all Assignments (Orders) and Vouchers into a single flat list
    const allActivities: any[] = [];
    const orders = [...purchases, ...workOrders];

    orders.forEach((order) => {
        // Only include if worker matches filter
        if (selectedWorkerId && String(order.worker_id) !== selectedWorkerId)
            return;

        const orderDate =
            "created_at" in order && typeof order.created_at === "string"
                ? order.created_at.split("T")[0]
                : (order as any).date;

        const orderId = order.id;
        const totalPieces =
            (order as any).total_pieces || (order as any).no_of_pieces || 0;
        const workerName = order.worker?.name || getWorkerName(order.worker_id);
        const sourceName = "total_pieces" in order ? "Khilai" : "Work Order";
        const details =
            "total_pieces" in order
                ? `Khilai #${(order as any).invoice_no}`
                : `Job #${String(orderId).slice(-6).toUpperCase()}`;

        // Assignment Entry
        allActivities.push({
            date: orderDate,
            id: orderId,
            displayId:
                "total_pieces" in order
                    ? (order as any).invoice_no
                    : String(orderId).slice(-6).toUpperCase(),
            type: "Assignment",
            source: sourceName,
            workerName,
            details,
            assigned: Number(totalPieces),
            received: 0,
            sortPriority: 1, // Assignment first on same day
            orderId: orderId,
            deadline: (order as any).deadline || "—",
        });

        // Voucher Entries
        order.vouchers?.forEach((v) => {
            allActivities.push({
                date: v.date,
                id: v.id,
                displayId: v.voucher_no,
                type: "Voucher",
                source: sourceName,
                workerName,
                details: `Voucher ${v.voucher_no} (${details})`,
                assigned: 0,
                received: Number(v.total_received),
                sortPriority: 2,
                orderId: orderId,
                deadline: "—",
            });
        });
    });

    // 2. Sort activities by date and priority
    allActivities.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.sortPriority - b.sortPriority;
    });

    // 3. Calculate running stats
    const jobReceivedMap: Record<string, number> = {};
    const jobAssignedMap: Record<string, number> = {};
    let runningBalance = 0;

    const processedLedger = allActivities.map((activity) => {
        const oId = activity.orderId;

        // Update job-specific stats
        jobAssignedMap[oId] = (jobAssignedMap[oId] || 0) + activity.assigned;
        jobReceivedMap[oId] = (jobReceivedMap[oId] || 0) + activity.received;

        const jobTotalAssigned = jobAssignedMap[oId];
        const jobTotalReceived = jobReceivedMap[oId];

        // Update account-wide balance (Received - Assigned)
        runningBalance = runningBalance + activity.received - activity.assigned;

        return {
            ...activity,
            completed: jobTotalReceived,
            due: Math.max(0, jobTotalAssigned - jobTotalReceived),
            balance: runningBalance,
        };
    });

    // 4. Apply final display filters
    const displayedLedger = processedLedger.filter((row) => {
        if (fromDate && row.date < fromDate) return false;
        if (toDate && row.date > toDate) return false;
        // Status filter (logic: if any status other than 'all' is picked, match against original job status)
        if (selectedStatus !== "all") {
            const originalOrder = orders.find((o) => o.id === row.orderId);
            const status = (originalOrder as any)?.status || "active"; // Khilai defaults to active
            if (status !== selectedStatus) return false;
        }
        return true;
    });

    const totalAssigned = displayedLedger.reduce((s, a) => s + a.assigned, 0);
    const totalReceived = displayedLedger.reduce((s, a) => s + a.received, 0);
    const netBalance =
        displayedLedger.length > 0
            ? displayedLedger[displayedLedger.length - 1].balance
            : 0;

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
                            Total Entries
                        </div>
                        <div className="text-2xl font-black">
                            {displayedLedger.length}
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
                            Total Received
                        </div>
                        <div className="text-2xl font-black text-green-800">
                            {totalReceived}
                        </div>
                    </div>
                    <div className="border-2 border-red-600 bg-red-50 p-3 rounded">
                        <div className="text-xs uppercase font-bold text-red-600 mb-1">
                            Net Balance (Pcs)
                        </div>
                        <div
                            className={`text-2xl font-black ${netBalance < 0 ? "text-red-700" : netBalance > 0 ? "text-green-700" : "text-gray-900"}`}
                        >
                            {netBalance}
                        </div>
                    </div>
                </div>

                {/* Ledger Table */}
                <table className="w-full border-collapse border border-black text-[11px] mb-8">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-2 text-left text-[10px] uppercase font-black w-16">
                                ID/No
                            </th>
                            <th className="border border-black px-2 py-2 text-left text-[10px] uppercase font-black w-24">
                                Date
                            </th>
                            <th className="border border-black px-2 py-2 text-left text-[10px] uppercase font-black w-32">
                                Type/Worker
                            </th>
                            <th className="border border-black px-2 py-2 text-left text-[10px] uppercase font-black">
                                Details
                            </th>
                            <th className="border border-black px-2 py-2 text-center text-[10px] uppercase font-black w-20">
                                Assigned
                            </th>
                            <th className="border border-black px-2 py-2 text-center text-[10px] uppercase font-black w-20">
                                Received
                            </th>
                            <th className="border border-black px-2 py-2 text-center text-[10px] uppercase font-black w-20">
                                Completed
                            </th>
                            <th className="border border-black px-2 py-2 text-center text-[10px] uppercase font-black w-20">
                                Due
                            </th>
                            <th className="border border-black px-2 py-2 text-right text-[10px] uppercase font-black bg-gray-50 w-24">
                                Balance
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedLedger.map((row, idx) => (
                            <tr
                                key={`${row.type}-${row.id}-${idx}`}
                                className={`hover:bg-gray-50 transition-colors ${row.type === "Assignment" ? "bg-gray-50/50" : ""}`}
                            >
                                <td className="border border-black px-2 py-1.5 font-mono">
                                    {row.displayId}
                                </td>
                                <td className="border border-black px-2 py-1.5 font-medium">
                                    {row.date}
                                </td>
                                <td className="border border-black px-2 py-1.5">
                                    <div className="flex flex-col gap-0.5">
                                        <span
                                            className={`text-[8px] font-black uppercase px-1 py-0 rounded w-fit ${row.type === "Assignment" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}
                                        >
                                            {row.type}
                                        </span>
                                        <span className="font-bold leading-tight">
                                            {row.workerName}
                                        </span>
                                    </div>
                                </td>
                                <td className="border border-black px-2 py-1.5 text-gray-600">
                                    {row.details}
                                </td>
                                <td className="border border-black px-2 py-1.5 text-center font-bold">
                                    {row.assigned > 0 ? row.assigned : "—"}
                                </td>
                                <td className="border border-black px-2 py-1.5 text-center font-bold">
                                    {row.received > 0 ? (
                                        <span className="text-emerald-600">
                                            +{row.received}
                                        </span>
                                    ) : (
                                        "—"
                                    )}
                                </td>
                                <td className="border border-black px-2 py-1.5 text-center text-brand-600 font-black">
                                    {row.completed}
                                </td>
                                <td className="border border-black px-2 py-1.5 text-center text-red-600 font-black">
                                    {row.due}
                                </td>
                                <td
                                    className={`border border-black px-2 py-1.5 text-right font-black bg-gray-50/50 ${row.balance < 0 ? "text-red-700" : row.balance > 0 ? "text-emerald-700" : "text-gray-900"}`}
                                >
                                    {row.balance}
                                </td>
                            </tr>
                        ))}
                        {displayedLedger.length === 0 && (
                            <tr>
                                <td
                                    colSpan={9}
                                    className="border border-black px-2 py-8 text-center text-gray-400 italic"
                                >
                                    No ledger entries found for the selected
                                    filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100 font-black text-gray-900">
                            <td
                                colSpan={4}
                                className="border border-black px-4 py-2 text-right uppercase tracking-widest text-[10px]"
                            >
                                Totals
                            </td>
                            <td className="border border-black px-2 py-2 text-center">
                                {totalAssigned}
                            </td>
                            <td className="border border-black px-2 py-2 text-center text-emerald-700">
                                {totalReceived}
                            </td>
                            <td
                                colSpan={2}
                                className="border border-black bg-gray-200"
                            ></td>
                            <td
                                className={`border border-black px-2 py-2 text-right ${netBalance < 0 ? "text-red-700" : netBalance > 0 ? "text-emerald-700" : ""}`}
                            >
                                {netBalance}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};
