import React, { useState, useEffect } from "react";
import { storage } from "../../services/storage";
import { COMPANY_NAME } from "../../constants";
import { Purchase, WorkOrder, Worker } from "../../types";
import { Printer, ChevronDown, ChevronRight, User } from "lucide-react";

export const LedgerReport: React.FC = () => {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedWorkerId, setSelectedWorkerId] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(
        new Set(),
    );

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
            workerId: order.worker_id,
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
            rate: Number(order.price_per_pc || 0),
            sortPriority: 1, // Assignment first on same day
            orderId: orderId,
            deadline: (order as any).deadline || "—",
        });

        // Voucher Entries
        order.vouchers?.forEach((v) => {
            allActivities.push({
                date: v.date,
                id: v.id,
                workerId: order.worker_id,
                displayId: v.voucher_no,
                type: "Voucher",
                source: sourceName,
                workerName,
                details: `Voucher ${v.voucher_no} (${details})`,
                assigned: 0,
                received: Number(v.total_received),
                rate: Number(order.price_per_pc || 0),
                sortPriority: 2,
                orderId: orderId,
                deadline: "—",
            });
        });

        // Payment Voucher Entries
        const pVouchers = (order as any).payment_vouchers || [];
        pVouchers.forEach((pv: any) => {
            allActivities.push({
                date: pv.date,
                id: pv.id,
                workerId: order.worker_id,
                displayId: pv.voucher_no,
                type: "Payment",
                source: sourceName,
                workerName,
                details: `Payment Voucher ${pv.voucher_no} - ₹${pv.price} (${details})`,
                assigned: 0,
                received: 0,
                amount: Number(pv.price),
                rate: 0,
                sortPriority: 3,
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

    // 3. Calculate per-worker running stats
    const workerRunningStats: Record<
        string,
        {
            balance: number;
            monetaryBalance: number;
            earned: number;
            paid: number;
            assigned: Record<string, number>;
            received: Record<string, number>;
        }
    > = {};

    const processedLedger = allActivities.map((activity) => {
        const wId = String(activity.workerId);
        const oId = String(activity.orderId);

        if (!workerRunningStats[wId]) {
            workerRunningStats[wId] = {
                balance: 0,
                monetaryBalance: 0,
                earned: 0,
                paid: 0,
                assigned: {},
                received: {},
            };
        }

        const stats = workerRunningStats[wId];
        stats.assigned[oId] = (stats.assigned[oId] || 0) + activity.assigned;
        stats.received[oId] = (stats.received[oId] || 0) + activity.received;

        // Piece balance: received - assigned
        stats.balance = stats.balance + activity.received - activity.assigned;

        // Monetary: Earned (from pieces received) - Paid (from payment vouchers)
        const earnedFromThis = activity.received * (activity.rate || 0);
        const paidInThis =
            activity.type === "Payment" ? activity.amount || 0 : 0;

        stats.earned += earnedFromThis;
        stats.paid += paidInThis;
        stats.monetaryBalance = stats.earned - stats.paid;

        return {
            ...activity,
            completed: stats.received[oId],
            due: Math.max(0, stats.assigned[oId] - stats.received[oId]),
            balance: stats.balance,
            monetaryBalance: stats.monetaryBalance,
            earnedFromThis,
            paidInThis,
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
    const totalPaid = displayedLedger
        .filter((a) => a.type === "Payment")
        .reduce((s, a) => s + (a.amount || 0), 0);
    const totalEarned = displayedLedger.reduce(
        (s, a) => s + (a.earnedFromThis || 0),
        0,
    );
    const totalMonetaryDue = Object.values(workerRunningStats).reduce(
        (s, st) => s + st.monetaryBalance,
        0,
    );

    // Grouping by OrderId
    const groupedLedger: Record<string, any[]> = {};
    displayedLedger.forEach((row) => {
        const oId = String(row.orderId);
        if (!groupedLedger[oId]) groupedLedger[oId] = [];
        groupedLedger[oId].push(row);
    });

    const toggleOrder = (id: string | number) => {
        const sid = String(id);
        const next = new Set(expandedOrders);
        if (next.has(sid)) next.delete(sid);
        else next.add(sid);
        setExpandedOrders(next);
    };

    const netBalance = Object.values(workerRunningStats).reduce(
        (sum, s) => sum + s.balance,
        0,
    );

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
            <div className="min-h-screen bg-white text-black mx-auto p-6 print:p-0 print:max-w-none">
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
                <div className="grid grid-cols-7 gap-2 mb-8 text-center text-[10px] md:text-sm">
                    <div className="border border-black p-2 rounded">
                        <div className="text-[9px] uppercase font-bold text-gray-500 mb-1">
                            Entries
                        </div>
                        <div className="text-sm md:text-xl font-black">
                            {displayedLedger.length}
                        </div>
                    </div>
                    <div className="border border-black p-2 rounded">
                        <div className="text-[9px] uppercase font-bold text-gray-500 mb-1">
                            Assigned
                        </div>
                        <div className="text-sm md:text-xl font-black">
                            {totalAssigned}
                        </div>
                    </div>
                    <div className="border border-green-700 bg-green-50 p-2 rounded">
                        <div className="text-[9px] uppercase font-bold text-green-700 mb-1">
                            Received
                        </div>
                        <div className="text-sm md:text-xl font-black text-green-800">
                            {totalReceived}
                        </div>
                    </div>
                    <div className="border border-amber-700 bg-amber-50 p-2 rounded">
                        <div className="text-[9px] uppercase font-bold text-amber-700 mb-1">
                            Earned (₹)
                        </div>
                        <div className="text-sm md:text-xl font-black text-amber-800">
                            ₹{totalEarned.toLocaleString()}
                        </div>
                    </div>
                    <div className="border border-purple-700 bg-purple-50 p-2 rounded">
                        <div className="text-[9px] uppercase font-bold text-purple-700 mb-1">
                            Paid (₹)
                        </div>
                        <div className="text-sm md:text-xl font-black text-purple-800">
                            ₹{totalPaid.toLocaleString()}
                        </div>
                    </div>
                    <div className="border border-red-600 bg-red-50 p-2 rounded">
                        <div className="text-[9px] uppercase font-bold text-red-600 mb-1">
                            Bal (Pcs)
                        </div>
                        <div
                            className={`text-sm md:text-xl font-black ${netBalance < 0 ? "text-red-700" : netBalance > 0 ? "text-green-700" : "text-gray-900"}`}
                        >
                            {netBalance}
                        </div>
                    </div>
                    <div className="border border-blue-600 bg-blue-50 p-2 rounded shadow-sm">
                        <div className="text-[9px] uppercase font-bold text-blue-600 mb-1">
                            Net Due (₹)
                        </div>
                        <div
                            className={`text-sm md:text-xl font-black ${totalMonetaryDue > 0 ? "text-blue-700" : "text-gray-900"}`}
                        >
                            ₹{totalMonetaryDue.toLocaleString()}
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
                            <th className="border border-black px-2 py-2 text-center text-[10px] uppercase font-black w-14">
                                Rate
                            </th>
                            <th className="border border-black px-2 py-2 text-center text-[10px] uppercase font-black w-24">
                                Assigned
                            </th>
                            <th className="border border-black px-2 py-2 text-center text-[10px] uppercase font-black w-28">
                                Recv/Paid
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
                            <th className="border border-black px-2 py-2 text-right text-[10px] uppercase font-black bg-blue-50/50 w-24">
                                Net Due (₹)
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedLedger).map(
                            ([orderId, activities]) => {
                                const isExpanded = expandedOrders.has(orderId);
                                const firstActivity = activities[0];
                                const workerName = firstActivity.workerName;
                                const orderTitle = firstActivity.details;
                                const source = firstActivity.source;
                                const wAssigned = activities.reduce(
                                    (s, a) => s + a.assigned,
                                    0,
                                );
                                const wReceived = activities.reduce(
                                    (s, a) => s + a.received,
                                    0,
                                );
                                const wPaid = activities
                                    .filter((a) => a.type === "Payment")
                                    .reduce((s, a) => s + (a.amount || 0), 0);
                                const wEarned = activities.reduce(
                                    (s, a) => s + (a.earnedFromThis || 0),
                                    0,
                                );
                                const lastActivity =
                                    activities.length > 0
                                        ? activities[activities.length - 1]
                                        : { balance: 0, monetaryBalance: 0 };
                                const wBalance = lastActivity.balance;
                                const wNetDue = lastActivity.monetaryBalance;

                                return (
                                    <React.Fragment key={orderId}>
                                        {/* Order Summary Row */}
                                        <tr
                                            onClick={() => toggleOrder(orderId)}
                                            className="bg-gray-100/80 cursor-pointer hover:bg-gray-200 transition-colors border-y border-black"
                                        >
                                            <td
                                                colSpan={4}
                                                className="px-4 py-3 border-x border-black/10"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4 text-brand-600" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                                                            <span className="text-[10px] font-black text-brand-600">
                                                                {source ===
                                                                "Khilai"
                                                                    ? "K"
                                                                    : "W"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-black text-xs uppercase tracking-wider">
                                                                {orderTitle}
                                                            </span>
                                                            <p className="text-[9px] text-gray-500 font-bold">
                                                                Worker:{" "}
                                                                {workerName} |{" "}
                                                                {
                                                                    activities.length
                                                                }{" "}
                                                                entries
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Summary Row Monetary Stats */}
                                            <td className="px-2 py-3 text-center border-x border-black/10 bg-amber-50/20">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-gray-400 uppercase font-black">
                                                        Earned
                                                    </span>
                                                    <span className="font-black text-amber-900">
                                                        ₹
                                                        {wEarned.toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-2 py-3 text-center font-black text-gray-900 border-x border-black/10">
                                                {wAssigned > 0
                                                    ? `${wAssigned} pcs`
                                                    : "—"}
                                            </td>
                                            <td className="px-2 py-3 text-center font-black text-emerald-800 border-x border-black/10 bg-emerald-50/30">
                                                <div className="flex flex-col gap-0.5">
                                                    {wReceived > 0 && (
                                                        <span className="text-emerald-700">
                                                            +{wReceived} pcs
                                                        </span>
                                                    )}
                                                    {wPaid > 0 && (
                                                        <span className="text-purple-700">
                                                            ₹{wPaid} Paid
                                                        </span>
                                                    )}
                                                    {wReceived === 0 &&
                                                        wPaid === 0 &&
                                                        "—"}
                                                </div>
                                            </td>
                                            <td className="px-2 py-3 text-center border-x border-black/10 text-gray-400">
                                                {wReceived}
                                            </td>
                                            <td className="px-2 py-3 text-center border-x border-black/10 text-red-600 font-bold">
                                                {Math.max(
                                                    0,
                                                    wAssigned - wReceived,
                                                )}
                                            </td>
                                            <td
                                                className={`px-2 py-3 text-right font-black border-x border-black/10 bg-gray-50/50 ${wBalance < 0 ? "text-red-700" : wBalance > 0 ? "text-emerald-700" : "text-gray-900"}`}
                                            >
                                                {wBalance} pcs
                                            </td>
                                            <td className="px-2 py-3 text-right font-black border-x border-black/10 bg-blue-50/50 text-blue-800">
                                                ₹{wNetDue.toLocaleString()}
                                            </td>
                                        </tr>

                                        {/* Individual Transaction Rows (Visible when expanded) */}
                                        {isExpanded &&
                                            activities.map((row, idx) => (
                                                <tr
                                                    key={`${row.type}-${row.id}-${idx}`}
                                                    className={`hover:bg-gray-50 transition-colors animate-in slide-in-from-top-1 duration-200 ${row.type === "Assignment" ? "bg-gray-50/50" : row.type === "Payment" ? "bg-purple-50/10" : "bg-white"}`}
                                                >
                                                    <td className="border border-black/10 px-2 py-1.5 font-mono text-gray-400">
                                                        {row.displayId}
                                                    </td>
                                                    <td className="border border-black/10 px-2 py-1.5 font-medium">
                                                        {row.date}
                                                    </td>
                                                    <td className="border border-black/10 px-2 py-1.5">
                                                        <span
                                                            className={`text-[8px] font-black uppercase px-1 py-0 rounded w-fit ${
                                                                row.type ===
                                                                "Assignment"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : row.type ===
                                                                        "Payment"
                                                                      ? "bg-purple-100 text-purple-700"
                                                                      : "bg-emerald-100 text-emerald-700"
                                                            }`}
                                                        >
                                                            {row.type}
                                                        </span>
                                                    </td>
                                                    <td className="border border-black/10 px-2 py-1.5 text-gray-600 italic">
                                                        {row.details}
                                                    </td>
                                                    <td className="border border-black/10 px-2 py-1.5 text-center text-gray-400 font-bold">
                                                        {row.rate
                                                            ? `₹${row.rate}`
                                                            : "—"}
                                                    </td>
                                                    <td className="border border-black/10 px-2 py-1.5 text-center font-bold">
                                                        {row.assigned > 0
                                                            ? `${row.assigned} pcs`
                                                            : "—"}
                                                    </td>
                                                    <td className="border border-black/10 px-2 py-1.5 text-center font-bold">
                                                        {row.received > 0 ? (
                                                            <span className="text-emerald-600">
                                                                +{row.received}{" "}
                                                                pcs
                                                            </span>
                                                        ) : row.type ===
                                                          "Payment" ? (
                                                            <span className="text-purple-700 font-black">
                                                                ₹{row.amount}
                                                            </span>
                                                        ) : (
                                                            "—"
                                                        )}
                                                    </td>
                                                    <td className="border border-black/10 px-2 py-1.5 text-center text-gray-400">
                                                        {row.completed}
                                                    </td>
                                                    <td className="border border-black/10 px-2 py-1.5 text-center text-red-600 font-bold">
                                                        {row.due}
                                                    </td>
                                                    <td
                                                        className={`border border-black/10 px-2 py-1.5 text-right font-bold bg-gray-50/30 ${row.balance < 0 ? "text-red-700" : row.balance > 0 ? "text-emerald-700" : "text-gray-900"}`}
                                                    >
                                                        {row.balance} pcs
                                                    </td>
                                                    <td className="border border-black/10 px-2 py-1.5 text-right font-black bg-blue-50/20 text-blue-900">
                                                        ₹
                                                        {row.monetaryBalance.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                    </React.Fragment>
                                );
                            },
                        )}
                        {displayedLedger.length === 0 && (
                            <tr>
                                <td
                                    colSpan={11}
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
