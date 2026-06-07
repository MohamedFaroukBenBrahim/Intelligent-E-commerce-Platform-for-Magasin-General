import { Product } from "./Product.model";

export interface CartItem {
  id: number;
  product: Product;   
  quantity: number;
}