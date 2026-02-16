import React, { useState } from "react";
import { PurchaseList } from "./PurchaseList";
import { PurchaseAdd } from "./PurchaseAdd";

export const PurchaseEntry: React.FC = () => {
    const [view, setView] = useState<"list" | "create">("list");

    if (view === "create") {
        return (
            <PurchaseAdd
                onCancel={() => setView("list")}
                onSuccess={() => setView("list")}
            />
        );
    }

    return <PurchaseList onCreateClick={() => setView("create")} />;
};

export default PurchaseEntry;
