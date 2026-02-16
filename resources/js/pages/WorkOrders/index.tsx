import React, { useState } from "react";
import { WorkOrderList } from "./WorkOrderList";
import { WorkOrderAdd } from "./WorkOrderAdd";

export const WorkOrders: React.FC = () => {
    const [view, setView] = useState<"list" | "create">("list");

    if (view === "create") {
        return (
            <WorkOrderAdd
                onCancel={() => setView("list")}
                onSuccess={() => setView("list")}
            />
        );
    }

    return <WorkOrderList onCreateClick={() => setView("create")} />;
};

export default WorkOrders;
