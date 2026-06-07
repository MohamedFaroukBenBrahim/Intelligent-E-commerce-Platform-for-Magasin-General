import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../Auth/auth.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { JobOfferResponseDto } from '../../Model/JobOfferResponse.model';
import { JobOfferDto } from '../../Model/JobOffer.model';
import { JobApplicationDto } from '../../Model/JobApplicationDto.model';
import { UpdateApplicationStatusDto } from '../../Model/UpdateApplicationStatusDto.model';

@Injectable({
  providedIn: 'root'
})
export class RecrutementService {
  constructor(private http:HttpClient,private authService:AuthService) { }
      
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  getActiveOffers(page = 0, size = 9): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/jobs?page=${page}&size=${size}`);
  }

  getAllOffers(page = 0, size = 999): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/jobs/all?page=${page}&size=${size}`, { headers: this.getHeaders() });
  }
  getAllOffersActive(page = 0, size = 9): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/jobs?page=${page}&size=${size}`);
  }
  getOfferById(id:number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/jobs/${id}`, { headers: this.getHeaders() });
  }
  createOffer(dto: JobOfferDto): Observable<JobOfferResponseDto> {
    return this.http.post<JobOfferResponseDto>('http://localhost:8080/jobs', dto, { headers: this.getHeaders() });
  }
  updateOffer(id: number, dto: JobOfferDto): Observable<JobOfferResponseDto> {
    return this.http.put<JobOfferResponseDto>(`http://localhost:8080/jobs/${id}`, dto, { headers: this.getHeaders() });
  }
  deleteOffer(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/jobs/${id}`, { headers: this.getHeaders() });
  }

  // AAPLY
  apply(jobOfferId: number, dto: JobApplicationDto): Observable<any> {
    return this.http.post<any>(`http://localhost:8080/jobs/${jobOfferId}/apply`,dto,{ headers: this.getHeaders() });
  }
  getMyApplications(page = 0, size = 9999): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/applications/me?page=${page}&size=${size}`,{ headers: this.getHeaders() });
  }
  getApplicationsForOffer(jobOfferId: number, page = 0, size = 9999): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/jobs/${jobOfferId}/applications?page=${page}&size=${size}`,{ headers: this.getHeaders() });
  }
  getAllApplications(
    page = 0,
    size = 10,
    filters?: {
      jobOfferId?: number | null;
      status?: string | null;
      search?: string | null;
    }
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));

    if (filters?.jobOfferId !== undefined && filters.jobOfferId !== null) {
      params = params.set('jobOfferId', String(filters.jobOfferId));
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    return this.http.get<any>('http://localhost:8080/applications', { headers: this.getHeaders(), params });
  }
  updateApplicationStatus(id: number, status: string): Observable<any> {
    const dto: UpdateApplicationStatusDto = { status };
    return this.http.patch<any>(`http://localhost:8080/applications/${id}/status`,dto,{ headers: this.getHeaders() });
  }
  getCvByApplicationId(applicationId: number): Observable<Blob> {
    return this.http.get(`http://localhost:8080/applications/${applicationId}/cv`,{ headers: this.getHeaders(), responseType: 'blob' });
  }
  getRecomandation(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/recommandations/${userId}`,{ headers: this.getHeaders() });
  }
  getmyprofile(): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/candidates/me`,{ headers: this.getHeaders() });
  }

}


