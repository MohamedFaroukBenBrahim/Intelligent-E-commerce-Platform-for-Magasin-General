import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../Model/Category.model';
import { AuthService } from '../Auth/auth.service';
import { AddCategory } from '../../Model/AddCategory.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http:HttpClient,private authService:AuthService) { }
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  
  getAllCategorys(): Observable<any> {
    return this.http.get<Category[]>('http://localhost:8080/category');
  }
  
  addCategory(category: AddCategory): Observable<AddCategory> {
    return this.http.post<AddCategory>('http://localhost:8080/category',category,{ headers: this.getHeaders() });
  }
  
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/category/${id}`,{ headers: this.getHeaders() });
  }
  updateCategory(id: number | undefined, category: Category): Observable<Category> {
    return this.http.put<Category>(`http://localhost:8080/category/${id}`, category,{ headers: this.getHeaders() });
  }
  getCategoryById(id: number) {
    return this.http.get<Category>(`http://localhost:8080/category/${id}`);
  }
  getsearchedCategory(text:string): Observable<any> {
    return this.http.get<Category[]>(`http://localhost:8080/category/search`,{params: { keyword: text }}  );
  }


}

