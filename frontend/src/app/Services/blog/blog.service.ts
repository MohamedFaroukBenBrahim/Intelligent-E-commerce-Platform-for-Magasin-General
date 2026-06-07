import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../Auth/auth.service';
import { Observable } from 'rxjs';
import { Blog } from '../../Model/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  constructor(private http:HttpClient,private authService:AuthService) { }
  
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  
  getAllBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>('http://localhost:8080/blog');
  }
  
  getPubAllBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>('http://localhost:8080/blog/published');
  }
  addBlog(formData: FormData): Observable<Blog> {
    const token = this.authService.getToken();
    return this.http.post<Blog>('http://localhost:8080/blog', formData, {headers: this.getHeaders()});
  }

  updateBlog(id: number, formData: FormData): Observable<Blog> {
    const token = this.authService.getToken();
    return this.http.put<Blog>(`http://localhost:8080/blog/${id}`, formData, {headers: this.getHeaders() });
  }
  deleteBlog(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/blog/${id}`, { headers: this.getHeaders() });
  }

  getBlogById(id: number): Observable<Blog> {
    return this.http.get<Blog>(`http://localhost:8080/blog/${id}`);
  }
  publishBlog(id: number): Observable<void> {
    return this.http.patch<void>(`http://localhost:8080/blog/${id}/publish`,null ,{ headers: this.getHeaders() });
  }
  unpublishBlog(id: number): Observable<void> {
    return this.http.patch<void>(`http://localhost:8080/blog/${id}/unpublish`,null, { headers: this.getHeaders() });
  }
  getsearchedBlogs(text:string, type?: string):Observable<any>{
    const params: any = { keyword: text };
    if (type) { params.type = type; }
    return this.http.get<Blog[]>('http://localhost:8080/blog/search/all', { params, headers: this.getHeaders() });
  }

  getsearchedpubBlogs(text:string, type?: string):Observable<any>{
    const params: any = { keyword: text };
    if (type) { params.type = type; }
    return this.http.get<Blog[]>('http://localhost:8080/blog/search', { params });
  }
}
