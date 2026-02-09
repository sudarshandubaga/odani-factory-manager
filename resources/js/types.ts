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
}

export interface WorkOrder {
    id: string;
    purchase_id: string;
    purchase?: Purchase;
    worker_id: string;
    worker?: Worker;
    work_type_id: string;
    workType?: WorkType;
    item_ids?: string[]; // Used when creating
    items?: SavedPurchaseItem[]; // Returned from backend
    deadline: string;
    status: "active" | "completed";
    created_at: string;
}

export interface User {
    username: string;
    role: "admin";
}
