export interface review {
  id?: number;
  rating: number;
  comment: string;
  productId: number;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
  username?: string;
  userProfilePicture?: string;
  productName?: string;
  productImageUrl?: string; 
}