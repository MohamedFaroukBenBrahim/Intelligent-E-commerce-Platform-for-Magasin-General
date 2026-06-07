import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../Auth/auth.service';
import { Observable } from 'rxjs';
import { review } from '../../Model/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  constructor(private http:HttpClient,private authService:AuthService) { }
    
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
      
  createreview(review:review): Observable<any> {
    return this.http.post<any>('http://localhost:8080/review',review,{headers :this.getHeaders()});
  }
  getProductReview(id:number): Observable<review[]>{
    return this.http.get<review[]>(`http://localhost:8080/review/product/${id}`)
  }
  myreviews(): Observable<any> {
    return this.http.get('http://localhost:8080/review/my', { headers: this.getHeaders() });
  }
  getallreviews(params :any): Observable<any> {
    return this.http.get('http://localhost:8080/review', { headers: this.getHeaders(),params });
  }
  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/review/${id}`,{ headers: this.getHeaders() })
  }
  updateReview(id: number, review: review): Observable<any> {
    return this.http.put<any>(`http://localhost:8080/review/${id}`, review, { headers: this.getHeaders() });
  }
}

