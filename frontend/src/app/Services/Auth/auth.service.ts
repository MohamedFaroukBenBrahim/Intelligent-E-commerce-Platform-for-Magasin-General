import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {jwtDecode} from 'jwt-decode';
import { SignUp } from '../../Model/SignUp.model';
import { Login } from '../../Model/Login.model';
import { Verify } from '../../Model/Verify.model';
import { ResetPassword } from '../../Model/ResetPassword.model';
import { ForgotPassword } from '../../Model/ForgotPassword.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(data: Login): Observable<any> {
    return this.http.post('http://localhost:8080/auth/login', data);
  }
  verify(data: Verify): Observable<any>{
    return this.http.post('http://localhost:8080/auth/verify', data);
  }

  signUp(data: SignUp): Observable<any> {
    return this.http.post('http://localhost:8080/auth/signup', data);
  }
  resendVerificationCode(email: string): Observable<any> {
    return this.http.post(`http://localhost:8080/auth/resend?email=${email}`, {});
  }
  saveToken(token: string) {
    localStorage.setItem("token", token);
  }
  getToken(): string | null {
    return localStorage.getItem("token");
  }
  getRoleFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded: any = jwtDecode(token);
    return decoded.authorities ? decoded.authorities[0] : null;
  }
  getUsername(): string | null {
    const token = this.getToken();
    if (!token){
      return null;
    } 
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub; 
  }
  getUserId(): number {
    const token = this.getToken();
    if (!token) return 0;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || 0;
  }
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; 
      return Date.now() > expiry;
    } catch {
      return true;
    }
  }
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  clearToken(): void {
    localStorage.removeItem('token');
  }

  logout() {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    this.clearToken();
    return this.http.post('http://localhost:8080/auth/logout', {}, { headers });
  }
  
  forgotPassword(data: ForgotPassword): Observable<any> {
    return this.http.post('http://localhost:8080/auth/forgot-password', data);
  }
  
  resetPassword(data: ResetPassword): Observable<any> {
    return this.http.post('http://localhost:8080/auth/reset-password', data);
  }
}
