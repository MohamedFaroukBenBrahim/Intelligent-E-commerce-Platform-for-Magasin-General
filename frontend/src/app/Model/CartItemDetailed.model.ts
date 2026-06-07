import { Product } from "./Product.model";

export interface CartItemDetailed {
  cartItemId: number;   
  product: Product;
  quantity: number;
  total: number;
}