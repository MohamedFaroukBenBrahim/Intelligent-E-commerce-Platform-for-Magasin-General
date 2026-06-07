import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../Auth/auth.service';
import { Observable } from 'rxjs';
import { Order } from '../../Model/Order.model';
import {KonnectPayment} from '../../Model/KonnectPayment.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http:HttpClient,private authService:AuthService) { }
  
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  placeOrder(address: string,paymentMethod:string): Observable<any> {
    return this.http.post<any>('http://localhost:8080/orders',{ address, shippingAddress: address, paymentMethod }, { headers: this.getHeaders() });
  }
  getAllOrders(): Observable<any>{
    return this.http.get<Order[]>('http://localhost:8080/orders/admin/all', { headers: this.getHeaders() });
  }
  updateOrderStatus(id: number, status: string | undefined): Observable<any> {
    if (status === 'CANCELLED') {
      return this.http.delete(`http://localhost:8080/orders/${id}/cancel`,{ headers: this.getHeaders() });
    }
    return this.http.put(`http://localhost:8080/orders/admin/${id}/status`,{ status },{ headers: this.getHeaders() });
  }
  initiateKonnectPayment(KonnectPayment:KonnectPayment):Observable<any>{
    return this.http.post(`http://localhost:8080/orders/payment/konnect`,KonnectPayment,{headers: this.getHeaders()});
  }
  confirmPayment(orderId: number, transactionId: string, success: boolean): Observable<any> {
    return this.http.get(`http://localhost:8080/payment/confirm`,{params: { orderId, transactionId, success },headers: this.getHeaders(),responseType: 'text'});
  }
}
