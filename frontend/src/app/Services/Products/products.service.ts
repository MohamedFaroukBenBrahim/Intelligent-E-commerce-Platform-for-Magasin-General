import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../Auth/auth.service';
import { Product } from '../../Model/Product.model';
import { AddProduct } from '../../Model/AddProduct.model';
import { UserService } from '../User/user.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http:HttpClient,private authService:AuthService,private userService:UserService) { }
  
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
    
  getAllProducts(): Observable<any> {
    return this.http.get<Product[]>('http://localhost:8080/product');
  }
  
  addProduct(formData: FormData): Observable<any> {
    return this.http.post<any>('http://localhost:8080/product', formData, { headers: this.getHeaders() });
  }
    
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/product/${id}`, { headers: this.getHeaders() });
  }
  
  updateProduct(id: number | undefined, formData: FormData): Observable<AddProduct> {
    return this.http.put<AddProduct>(`http://localhost:8080/product/${id}`, formData, { headers: this.getHeaders() });
  }
  
  getProductById(id: number) {
    return this.http.get<Product>(`http://localhost:8080/product/${id}`);
  }
  getProductByIdWithheader(id: number) {
    return this.http.get<Product>(`http://localhost:8080/product/${id}`,{headers:this.getHeaders()});
  }
  getsearchedProdcuts(params:any):Observable<any>{
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<Product[]>('http://localhost:8080/product/search',{ params: httpParams });
  }
  adjustStock(id: number, adjustment: number, reason: string): Observable<any> {
    return this.http.patch(`http://localhost:8080/product/${id}/stock`,{ adjustment, reason },{ headers: this.getHeaders() });
  }
  getRecommandationPy(id:number): Observable<any[]>{
    return this.http.get<any[]>(`http://localhost:5011/recommend/${id}`)
  }
}
