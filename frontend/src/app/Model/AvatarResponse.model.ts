import { Product } from "./Product.model";

export interface AvatarResponse {
  chatResponse: string;
  recommendedProducts?: Product[];
  emotion?: string;
  audioUrl?: string;
  // Optional viseme timeline produced by backend for lip-sync: [{time: seconds, viseme: 'AA'}]
  visemes?: { time: number; viseme: string }[];
}