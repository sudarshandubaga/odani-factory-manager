import React from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
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
            onEditClick={(order) => {
                navigate(`/work-orders/${order.id}/edit`);
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

export const WorkOrderEditRoute: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <WorkOrderAdd
            onCancel={() => navigate(-1)}
            onSuccess={() => navigate(-1)}
            editId={id}
        />
    );
};
