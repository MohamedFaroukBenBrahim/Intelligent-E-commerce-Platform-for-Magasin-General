import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatserviceService {

  constructor(private http: HttpClient) {}

  sendMessage(message: string, context: string = ''): Observable<any> {
    return this.http.post<any>('http://localhost:8080/chat',{ message, context });
  }
}
