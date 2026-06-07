import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../Auth/auth.service';
import { Observable } from 'rxjs';
import { SignUp } from '../../Model/SignUp.model';
import { User } from '../../Model/User.model';

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  constructor(private http:HttpClient,private authService:AuthService) { }
  
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
    
  getstats(): Observable<any> {
    return this.http.get<any[]>('http://localhost:8080/admin/stats',{headers: this.getHeaders()});
  }
  getAllusers(): Observable<any>{
    return this.http.get<any[]>('http://localhost:8080/admin/users',{headers : this.getHeaders()});
  }
  getAllsearchusers(searchtext:string): Observable<any>{
    return this.http.get<any[]>('http://localhost:8080/admin/users/search',{params:{keyword:searchtext},headers : this.getHeaders()});
  }
  toggleUserHrStatus(id: number): Observable<User> {
    return this.http.patch<User>(`http://localhost:8080/admin/users/${id}/toggle-user-hr`, {}, { headers: this.getHeaders() });
  }
  disableaccount(id : number ){
    return this.http.patch<User>(`http://localhost:8080/admin/users/${id}/enabledisable`,{},{headers : this.getHeaders()});
  }
  exportfile(): Observable<Blob> {
    return this.http.get('http://localhost:8080/admin/stats/export', {headers: this.getHeaders(),responseType: 'blob'});
  }
  
  
}
