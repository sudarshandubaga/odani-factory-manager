import React, { useState } from "react";
import { User, Tag, Truck } from "lucide-react";
import { WorkersManager } from "./WorkersManager";
import { WorkTypesManager } from "./WorkTypesManager";
import { SuppliersManager } from "./SuppliersManager";

export const MasterData: React.FC = () => {
    const [activeTab, setActiveTab] = useState<
        "workers" | "workTypes" | "suppliers"
    >("workers");

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab("workers")}
                        className={`${activeTab === "workers" ? "border-brand-500 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <User className="w-4 h-4 mr-2" /> Workers
                    </button>
                    <button
                        onClick={() => setActiveTab("workTypes")}
                        className={`${activeTab === "workTypes" ? "border-brand-500 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <Tag className="w-4 h-4 mr-2" /> Work Types
                    </button>
                    <button
                        onClick={() => setActiveTab("suppliers")}
                        className={`${activeTab === "suppliers" ? "border-brand-500 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <Truck className="w-4 h-4 mr-2" /> Suppliers
                    </button>
                </nav>
            </div>

            {activeTab === "workers" && <WorkersManager />}
            {activeTab === "workTypes" && <WorkTypesManager />}
            {activeTab === "suppliers" && <SuppliersManager />}
        </div>
    );
};

export default MasterData;
