import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../Auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
  }

  getStats(): Observable<any> {
    return this.http.get(`http://localhost:8080/admin/dashboard/stats`, { headers: this.getHeaders() });
  }
  getOrdersPerDay(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/admin/dashboard/orders-per-day`, { headers: this.getHeaders() });
  }
  getRevenuePerDay(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/admin/dashboard/revenue-per-day`, { headers: this.getHeaders() });
  }
  getProductsByCategory(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/admin/dashboard/products-by-category`, { headers: this.getHeaders() });
  }
  getTopProducts(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/admin/dashboard/top-products`, { headers: this.getHeaders() });
  }
  getUsersPerDay(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/admin/dashboard/users-per-day`, { headers: this.getHeaders() });
  }
  getApplicationsByStatus(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/admin/dashboard/applications-by-status`, { headers: this.getHeaders() });
  }
}
