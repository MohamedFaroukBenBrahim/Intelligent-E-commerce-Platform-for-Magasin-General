import { OrderItem } from "./OrderItem.model";

export interface Order {
    id: number;
    user?: {
        id: number;
        username?: string;
    };
    items?: OrderItem[];
    status?: string; 
    totalAmount?: number;
    shippingAddress?: string;
    createdAt?: string;
    updatedAt?: string;
}
