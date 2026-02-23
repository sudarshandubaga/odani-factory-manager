import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { WorkOrderList } from "./WorkOrderList";
import { WorkOrderAdd } from "./WorkOrderAdd";

export const WorkOrdersPageRoute: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const workTypeId = searchParams.get("type") || undefined;

    return (
        <WorkOrderList
            onCreateClick={() => {
                const url = workTypeId
                    ? `/work-orders/add?type=${workTypeId}`
                    : "/work-orders/add";
                navigate(url);
            }}
            workTypeId={workTypeId}
        />
    );
};

export const WorkOrderAddRoute: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const workTypeId = searchParams.get("type") || undefined;

    return (
        <WorkOrderAdd
            onCancel={() => navigate(-1)}
            onSuccess={() => navigate(-1)}
            defaultWorkTypeId={workTypeId}
        />
    );
};
