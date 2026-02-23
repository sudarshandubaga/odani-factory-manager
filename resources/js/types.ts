export interface Supplier {
    id: string;
    name: string;
    mobile?: string;
    email?: string;
    shopName?: string;
    address?: string;
    state?: string;
    city?: string;
    pincode?: string;
}

export interface PurchaseItem {
    id: string;
    sNo: number;
    sizeMeters: number;
    patRaw: number; // size / patSize
    patRound: number; // Math.round(patRaw)
    piecesRaw: number; // Same as patRaw for now, or calculated
    piecesRound: number; // Final pieces
    status: "pending" | "assigned" | "completed";
}

export interface SavedPurchaseItem {
    id: string;
    s_no: number;
    size_meters: number;
    pat_raw: number;
    pat_round: number;
    pieces_raw: number;
    pieces_round: number;
    status: "pending" | "assigned" | "completed";
}

export interface Purchase {
    id: string;
    supplier_id: string;
    supplier?: Supplier; // Optional if joined
    invoice_no: string;
    date: string;
    pat_size: number;
    items: SavedPurchaseItem[];
    items_count?: number;
    created_at: number;
}

export interface Worker {
    id: string;
    name: string;
    image?: string;
    email?: string;
    mobile: string;
    notes?: string;
}

export interface WorkType {
    id: string;
    name: string;
    parent_id?: string | null;
    parent?: WorkType;
}

export interface WorkOrder {
    id: string;
    purchase_id?: string | null;
    purchase?: Purchase;
    parent_order_id?: string | null;
    parentOrder?: WorkOrder;
    worker_id: string;
    worker?: Worker;
    work_type_id: string;
    workType?: WorkType;
    item_ids?: string[]; // Used when creating
    items?: SavedPurchaseItem[]; // Returned from backend
    deadline: string;
    image?: string | null;
    image_url?: string | null;
    no_of_pieces?: number | null;
    remarks?: string | null;
    received_pcs?: number | null;
    due_pcs?: number | null;
    notes?: string | null;
    status: "active" | "completed";
    created_at: string;
    childOrders?: WorkOrder[];
}

export interface Tenant {
    id: string;
    name: string;
    domain: string;
    expires_at: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    username?: string;
    role: "admin";
    profile_photo?: string;
    tenant?: Tenant;
}
