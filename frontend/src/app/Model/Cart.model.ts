import { CartItem } from "./CartItem.model";

export interface Cart{
    id:number;
    items:CartItem[];
}