import api from "./api";
import { Purchase, Supplier, Worker, WorkOrder, WorkType } from "../types";

export const storage = {
    getPurchases: async () => {
        const res = await api.get<Purchase[]>("/purchases");
        return res.data;
    },
    getPurchase: async (id: string | number) => {
        const res = await api.get<Purchase>(`/purchases/${id}`);
        return res.data;
    },
    addPurchase: async (p: any) => {
        const res = await api.post<Purchase>("/purchases", p);
        return res.data;
    },

    getSuppliers: async () => {
        const res = await api.get<Supplier[]>("/suppliers");
        return res.data;
    },
    addSupplier: async (s: any) => {
        const res = await api.post<Supplier>("/suppliers", s);
        return res.data;
    },
    deleteSupplier: async (id: string | number) => {
        await api.delete(`/suppliers/${id}`);
    },

    getWorkers: async () => {
        const res = await api.get<Worker[]>("/workers");
        return res.data;
    },
    addWorker: async (w: any) => {
        const res = await api.post<Worker>("/workers", w);
        return res.data;
    },
    deleteWorker: async (id: string | number) => {
        await api.delete(`/workers/${id}`);
    },

    getWorkTypes: async () => {
        const res = await api.get<WorkType[]>("/work-types");
        return res.data;
    },
    addWorkType: async (wt: any) => {
        const res = await api.post<WorkType>("/work-types", wt);
        return res.data;
    },
    deleteWorkType: async (id: string | number) => {
        await api.delete(`/work-types/${id}`);
    },

    getWorkOrders: async () => {
        const res = await api.get<WorkOrder[]>("/work-orders");
        return res.data;
    },
    addWorkOrder: async (wo: any) => {
        const res = await api.post<WorkOrder>("/work-orders", wo);
        return res.data;
    },
    updateWorkOrderStatus: async (
        id: string | number,
        status: "active" | "completed",
    ) => {
        const res = await api.put<WorkOrder>(`/work-orders/${id}`, { status });
        return res.data;
    },
};
