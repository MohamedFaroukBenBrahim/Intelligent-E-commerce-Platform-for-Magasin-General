import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../Auth/auth.service';
import { Observable } from 'rxjs';
import { Cart } from '../../Model/Cart.model';
import { CartItem } from '../../Model/CartItem.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  constructor(private http:HttpClient,private authService:AuthService) { }
  
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  getCart(): Observable<Cart> {
    return this.http.get<Cart>('http://localhost:8080/cart', { headers: this.getHeaders() });
  }
  
  addCart(productId: number, quantity: number): Observable<Cart> {
    return this.http.post<Cart>('http://localhost:8080/cart/items', { productId, quantity }, { headers: this.getHeaders() });
  }


  updateCartItem(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`http://localhost:8080/cart/items/${itemId}`, { quantity }, { headers: this.getHeaders() });
  }

  removeCartItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`http://localhost:8080/cart/items/${itemId}`, { headers: this.getHeaders() });
  }
}

