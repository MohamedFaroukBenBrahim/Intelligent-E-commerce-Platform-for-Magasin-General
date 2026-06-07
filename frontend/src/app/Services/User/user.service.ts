import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../Auth/auth.service';
import { Observable } from 'rxjs';
import { ProfielEdit } from '../../Model/pofieledit.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http:HttpClient,private authService:AuthService) { }
    
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
      
  getme(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/users/me',{headers :this.getHeaders()});
  }
  updateprofielpicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('picture', file);
    return this.http.patch<any>('http://localhost:8080/users/me/picture', formData, {headers: this.getHeaders() });
  }
  updateprofiel(profileedit : ProfielEdit ): Observable<string> {
    return this.http.put<string>('http://localhost:8080/users/me',profileedit,{headers : this.getHeaders()});
  }
  getmyorder(): Observable<any>{
    return this.http.get<any[]>('http://localhost:8080/orders',{headers : this.getHeaders()})
  } 
  //RECRUTEMENT
  getMyProfile(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/candidates/me',{ headers: this.getHeaders() });
  }

  updateProfile(bio: string, title: string): Observable<any> {
    return this.http.put<any>('http://localhost:8080/candidates/me',{ bio, title },{ headers: this.getHeaders() });
  }

  uploadCv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cv', file);
    return this.http.patch<any>('http://localhost:8080/candidates/me/cv',formData,{ headers:this.getHeaders()});
  }
}
