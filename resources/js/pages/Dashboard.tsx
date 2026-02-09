import React, { useState, useEffect } from "react";
import { storage } from "../services/storage";
import { Link } from "react-router-dom";
import { FileText, ClipboardCheck, Users } from "lucide-react";

export const Dashboard: React.FC = () => {
    const [purchases, setPurchases] = useState<any[]>([]);
    const [workOrders, setWorkOrders] = useState<any[]>([]);
    const [workers, setWorkers] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const [p, wo, w] = await Promise.all([
                storage.getPurchases(),
                storage.getWorkOrders(),
                storage.getWorkers(),
            ]);
            setPurchases(p);
            setWorkOrders(wo);
            setWorkers(w);
        };
        fetchData();
    }, []);

    const activeOrders = workOrders.filter((o) => o.status === "active").length;
    const recentPurchases = purchases.slice(0, 5);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Purchases
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {purchases.length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link
                                to="/purchase"
                                className="font-medium text-brand-600 hover:text-brand-900"
                            >
                                View all
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ClipboardCheck className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Active Work Orders
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {activeOrders}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link
                                to="/work-orders"
                                className="font-medium text-brand-600 hover:text-brand-900"
                            >
                                View all
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Workers
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {workers.length}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link
                                to="/workers"
                                className="font-medium text-brand-600 hover:text-brand-900"
                            >
                                Manage
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Recent Purchases
                    </h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {recentPurchases.map((purchase) => (
                        <li key={purchase.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-brand-600 truncate">
                                    Inv #{purchase.invoice_no}
                                </p>
                                <div className="ml-2 flex-shrink-0 flex">
                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {purchase.date}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                        Total Items:{" "}
                                        {purchase.items?.length || 0}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                    {recentPurchases.length === 0 && (
                        <li className="px-4 py-4 text-sm text-gray-500">
                            No purchases yet.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};
