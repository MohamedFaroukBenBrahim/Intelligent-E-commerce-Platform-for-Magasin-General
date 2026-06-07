import { Category } from "./Category.model";

export interface AddProduct{
    name:string;
    description:string;
    state:string;
    price:number;
    discount:number;
    quantity:number;
    category:number | null;
}