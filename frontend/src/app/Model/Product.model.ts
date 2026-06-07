import { Category } from "./Category.model";

export interface Product{
    id:number;
    name:string;
    description:string;
    state:string;
    price:number;
    discount:number;
    rate:number;
    quantity:number;
    category:Category| null;
    createdAt:string;
    imageUrl?: string;
}