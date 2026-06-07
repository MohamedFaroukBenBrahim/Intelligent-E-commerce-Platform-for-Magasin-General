import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RHNavbarComponent } from '../rh-navbar/rh-navbar.component';
import { RecrutementService } from '../../Services/recrutement/recrutement.service';
import { JobOfferResponseDto } from '../../Model/JobOfferResponse.model';

@Component({
  selector: 'app-rh-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RHNavbarComponent],
  templateUrl: './rh-applications.component.html',
  styleUrl: './rh-applications.component.css'
})
export class RhApplicationsComponent implements OnInit {
  constructor(private recrutementService: RecrutementService) {}

  loading = true;
  errorMessage = '';

  applications: any[] = [];
  offers: JobOfferResponseDto[] = [];

  selectedStatus: 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' = 'ALL';
  selectedJobId = 'ALL';
  searchText = '';

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  downloadingCvFor: number | null = null;
  updatingStatusFor: number | null = null;

  ngOnInit(): void {
    this.loadOffers();
    this.loadApplications();
  }

  get filteredLabel(): string {
    const parts: string[] = [];
    if (this.selectedStatus !== 'ALL') parts.push(this.selectedStatus.toLowerCase());
    if (this.selectedJobId !== 'ALL') parts.push('job filtered');
    if (this.searchText.trim()) parts.push(`search: ${this.searchText.trim()}`);
    return parts.length ? parts.join(' · ') : 'all records';
  }

  get pageStart(): number {
    if (this.totalElements === 0) return 0;
    return this.page * this.size + 1;
  }

  get pageEnd(): number {
    return Math.min((this.page + 1) * this.size, this.totalElements);
  }

  get pageNumbers(): number[] {
    const totalPages = Math.max(this.totalPages, 1);
    const start = Math.max(0, this.page - 2);
    const end = Math.min(totalPages - 1, this.page + 2);
    const pages: number[] = [];
    for (let index = start; index <= end; index++) {
      pages.push(index);
    }
    return pages;
  }

  loadOffers(): void {
    this.recrutementService.getAllOffers(0, 9999).subscribe({
      next: (res) => { this.offers = this.unwrapOffers(res); },
      error: () => { this.offers = []; }
    });
  }

  loadApplications(): void {
    this.loading = true;
    this.errorMessage = '';

    const jobOfferId = this.selectedJobId === 'ALL' ? null : Number(this.selectedJobId);
    const status = this.selectedStatus === 'ALL' ? null : this.selectedStatus;
    const search = this.searchText.trim() || null;

    this.recrutementService.getAllApplications(this.page, this.size, { jobOfferId, status, search }).subscribe({
      next: (res) => {
        this.applications = this.unwrapApplications(res).map((application: any) => this.normalizeApplication(application));
        this.totalElements = Number(res?.totalElements ?? this.applications.length);
        this.totalPages = Number(res?.totalPages ?? 1);
        this.page = Number(res?.number ?? this.page);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load applications right now.';
        this.applications = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.page = 0;
    this.loadApplications();
  }

  clearFilters(): void {
    this.selectedStatus = 'ALL';
    this.selectedJobId = 'ALL';
    this.searchText = '';
    this.page = 0;
    this.loadApplications();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.page) {
      return;
    }
    this.page = page;
    this.loadApplications();
  }

  updateStatus(applicationId: number, status: 'PENDING' | 'ACCEPTED' | 'REJECTED'): void {
    this.updatingStatusFor = applicationId;
    this.recrutementService.updateApplicationStatus(applicationId, status).subscribe({
      next: () => {
        this.updatingStatusFor = null;
        this.loadApplications();
      },
      error: () => {
        this.updatingStatusFor = null;
      }
    });
  }

  downloadCv(applicationId: number): void {
    this.downloadingCvFor = applicationId;
    this.recrutementService.getCvByApplicationId(applicationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `application_${applicationId}_cv.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.downloadingCvFor = null;
      },
      error: () => {
        this.downloadingCvFor = null;
      }
    });
  }

  getOfferTitle(jobOfferId: number | null | undefined): string {
    if (!jobOfferId) return 'All jobs';
    const offer = this.offers.find((item) => item.id === jobOfferId);
    return offer?.title ?? `Job #${jobOfferId}`;
  }

  getStatusClass(status: string): string {
    const normalized = (status ?? '').toUpperCase();
    if (normalized === 'ACCEPTED') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (normalized === 'REJECTED') return 'bg-rose-50 text-rose-700 border-rose-100';
    return 'bg-amber-50 text-amber-700 border-amber-100';
  }

  private unwrapApplications(response: any): any[] {
    if (Array.isArray(response)) return response;
    return response?.content ?? [];
  }

  private unwrapOffers(response: any): JobOfferResponseDto[] {
    if (Array.isArray(response)) return response;
    return response?.content ?? [];
  }

  private normalizeApplication(application: any): any {
    return {
      ...application,
      applicantUsername: application.applicantUsername ?? application.candidateUsername ?? 'Candidate',
      applicantEmail: application.applicantEmail ?? application.email ?? '',
      jobTitle: application.jobTitle ?? application.offerTitle ?? application.title ?? 'Job offer',
      jobOfferId: application.jobOfferId ?? application.offerId ?? application.offer?.id ?? null,
      status: (application.status ?? 'PENDING').toUpperCase(),
      appliedAt: application.appliedAt ?? application.createdAt ?? '',
      coverLetter: application.coverLetter ?? ''
    };
  }

}
