import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../Auth/auth.service';
import { contact } from '../../Model/contact.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(private http:HttpClient,private authService:AuthService) { }
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  sendcontact(contact : contact): Observable<contact> {
    return this.http.post<contact>('http://localhost:8080/contact',contact);
  }
  
  getcontacts(keyword?: string, read?: boolean, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams();
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (read !== undefined && read !== null) {
      params = params.set('read', String(read));
    }
    params = params.set('page', String(page));
    params = params.set('size', String(size));
    
    return this.http.get<any>('http://localhost:8080/contact/admin', { headers: this.getHeaders(), params });
  }
  deletecontacts(id:number): Observable<any> {
    return this.http.delete<contact>(`http://localhost:8080/contact/admin/${id}`,{headers : this.getHeaders()});
  }
  readcontacts(id:number): Observable<any> {
    return this.http.patch<any>(`http://localhost:8080/contact/admin/${id}/read`,{},{headers : this.getHeaders()});
  }
}
