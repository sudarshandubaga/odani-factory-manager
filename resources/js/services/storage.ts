import api from "./api";
import {
    Purchase,
    Supplier,
    Voucher,
    Worker,
    WorkOrder,
    WorkType,
} from "../types";

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
    updatePurchase: async (id: string | number, p: any) => {
        const res = await api.put<Purchase>(`/purchases/${id}`, p);
        return res.data;
    },

    deletePurchase: async (id: string | number) => {
        await api.delete(`/purchases/${id}`);
    },
    getPurchaseTrash: async () => {
        const res = await api.get<Purchase[]>("/purchases/trash");
        return res.data;
    },
    restorePurchase: async (id: string | number) => {
        await api.post(`/purchases/${id}/restore`);
    },
    forceDeletePurchase: async (id: string | number) => {
        await api.delete(`/purchases/${id}/force`);
    },
    bulkDeletePurchases: async (ids: (string | number)[]) => {
        await api.post("/purchases/bulk-delete", { ids });
    },
    bulkRestorePurchases: async (ids: (string | number)[]) => {
        await api.post("/purchases/bulk-restore", { ids });
    },
    bulkForceDeletePurchases: async (ids: (string | number)[]) => {
        await api.post("/purchases/bulk-force-delete", { ids });
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
    getWorkOrder: async (id: string | number) => {
        const res = await api.get<WorkOrder>(`/work-orders/${id}`);
        return res.data;
    },
    addWorkOrder: async (wo: FormData) => {
        const res = await api.post<WorkOrder>("/work-orders", wo);
        return res.data;
    },
    updateWorkOrder: async (id: string | number, wo: FormData) => {
        // Laravel doesn't handle PUT with multipart/form-data natively
        // We use POST with _method spoofing
        wo.append("_method", "PUT");
        const res = await api.post<WorkOrder>(`/work-orders/${id}`, wo);
        return res.data;
    },
    updateWorkOrderStatus: async (
        id: string | number,
        status: "active" | "completed",
        data?: { received_pcs?: number; notes?: string },
    ) => {
        const res = await api.put<WorkOrder>(`/work-orders/${id}`, {
            status,
            ...data,
        });
        return res.data;
    },
    deleteWorkOrder: async (id: string | number) => {
        await api.delete(`/work-orders/${id}`);
    },
    getWorkOrderTrash: async () => {
        const res = await api.get<WorkOrder[]>("/work-orders/trash");
        return res.data;
    },
    restoreWorkOrder: async (id: string | number) => {
        await api.post(`/work-orders/${id}/restore`);
    },
    forceDeleteWorkOrder: async (id: string | number) => {
        await api.delete(`/work-orders/${id}/force`);
    },
    bulkDeleteWorkOrders: async (ids: (string | number)[]) => {
        await api.post("/work-orders/bulk-delete", { ids });
    },
    bulkRestoreWorkOrders: async (ids: (string | number)[]) => {
        await api.post("/work-orders/bulk-restore", { ids });
    },
    bulkForceDeleteWorkOrders: async (ids: (string | number)[]) => {
        await api.post("/work-orders/bulk-force-delete", { ids });
    },

    getVouchers: async () => {
        const res = await api.get<Voucher[]>("/vouchers");
        return res.data;
    },
    addVoucher: async (v: FormData) => {
        const res = await api.post<Voucher>("/vouchers", v);
        return res.data;
    },
    getVoucher: async (id: string | number) => {
        const res = await api.get<Voucher>(`/vouchers/${id}`);
        return res.data;
    },
    updateVoucher: async (id: string | number, v: FormData) => {
        v.append("_method", "PUT");
        const res = await api.post<Voucher>(`/vouchers/${id}`, v);
        return res.data;
    },
    deleteVoucher: async (id: string | number) => {
        await api.delete(`/vouchers/${id}`);
    },
    getVoucherTrash: async () => {
        const res = await api.get<Voucher[]>("/vouchers/trash");
        return res.data;
    },
    restoreVoucher: async (id: string | number) => {
        await api.post(`/vouchers/${id}/restore`);
    },
    forceDeleteVoucher: async (id: string | number) => {
        await api.delete(`/vouchers/${id}/force`);
    },
    bulkDeleteVouchers: async (ids: (string | number)[]) => {
        await api.post("/vouchers/bulk-delete", { ids });
    },
    bulkRestoreVouchers: async (ids: (string | number)[]) => {
        await api.post("/vouchers/bulk-restore", { ids });
    },
    bulkForceDeleteVouchers: async (ids: (string | number)[]) => {
        await api.post("/vouchers/bulk-force-delete", { ids });
    },

    getPaymentVouchers: async () => {
        const res = await api.get<any[]>("/payment-vouchers");
        return res.data;
    },
    addPaymentVoucher: async (v: FormData) => {
        const res = await api.post<any>("/payment-vouchers", v);
        return res.data;
    },
    getPaymentVoucher: async (id: string | number) => {
        const res = await api.get<any>(`/payment-vouchers/${id}`);
        return res.data;
    },
    updatePaymentVoucher: async (id: string | number, v: FormData) => {
        v.append("_method", "PUT");
        const res = await api.post<any>(`/payment-vouchers/${id}`, v);
        return res.data;
    },
    deletePaymentVoucher: async (id: string | number) => {
        await api.delete(`/payment-vouchers/${id}`);
    },
    getPaymentVoucherTrash: async () => {
        const res = await api.get<any[]>("/payment-vouchers/trash");
        return res.data;
    },
    restorePaymentVoucher: async (id: string | number) => {
        await api.post(`/payment-vouchers/${id}/restore`);
    },
    forceDeletePaymentVoucher: async (id: string | number) => {
        await api.delete(`/payment-vouchers/${id}/force`);
    },
    bulkDeletePaymentVouchers: async (ids: (string | number)[]) => {
        await api.post("/payment-vouchers/bulk-delete", { ids });
    },
    bulkRestorePaymentVouchers: async (ids: (string | number)[]) => {
        await api.post("/payment-vouchers/bulk-restore", { ids });
    },
    bulkForceDeletePaymentVouchers: async (ids: (string | number)[]) => {
        await api.post("/payment-vouchers/bulk-force-delete", { ids });
    },
};
