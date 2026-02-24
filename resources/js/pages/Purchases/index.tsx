import React, { useState } from "react";
import { PurchaseList } from "./PurchaseList";
import { PurchaseAdd } from "./PurchaseAdd";

export const PurchaseEntry: React.FC = () => {
    const [view, setView] = useState<"list" | "create">("list");
    const [editId, setEditId] = useState<string | null>(null);

    if (view === "create") {
        return (
            <PurchaseAdd
                onCancel={() => {
                    setView("list");
                    setEditId(null);
                }}
                onSuccess={() => {
                    setView("list");
                    setEditId(null);
                }}
                editId={editId || undefined}
            />
        );
    }

    return (
        <PurchaseList
            onCreateClick={() => {
                setEditId(null);
                setView("create");
            }}
            onEditClick={(p) => {
                setEditId(String(p.id));
                setView("create");
            }}
        />
    );
};

export default PurchaseEntry;
