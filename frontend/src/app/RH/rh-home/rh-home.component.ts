import { Component, OnInit } from '@angular/core';
import { RHNavbarComponent } from "../rh-navbar/rh-navbar.component";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { profile } from '../../Model/profiel.model';
import { UserService } from '../../Services/User/user.service';
import { RecrutementService } from '../../Services/recrutement/recrutement.service';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-rh-home',
  standalone: true,
  imports: [RHNavbarComponent, CommonModule, RouterLink],
  templateUrl: './rh-home.component.html',
  styleUrl: './rh-home.component.css'
})
export class RHHomeComponent implements OnInit {
  constructor(private user_service: UserService,private recrutementService: RecrutementService) {}

  loading = true;
  errorMessage = '';

  dashboardStats = {
    activeOffers: 0,
    totalOffers: 0,
    totalApplications: 0,
    acceptedApplications: 0,
    pendingApplications: 0,
    acceptanceRate: 0
  };

  latestOffers: any[] = [];
  recentApplications: any[] = [];

  me: profile = {
    id: 0,
    role: '', 
    username: '',
    email: '', 
    address: '', 
    phone: '', 
    profilePictureUrl: ''
  };

  ngOnInit(): void {
    this.user_service.getme().subscribe({
      next: (res) => { this.me = res; },
      error: () => { console.log('ERROR LOADING PROFILE'); }
    });
    this.loadDashboard();
  }

  getInitials(): string {
    return this.me.username ? this.me.username.charAt(0).toUpperCase() : 'U';
  }

  getSkills(skills: string): string[] {
    if (!skills) return [];
    return skills.split(',').map(skill => skill.trim()).filter(Boolean);
  }

  getTimeAgo(dateStr: string): string {
    if (!dateStr) return 'Recently';
    const now = new Date();
    const posted = new Date(dateStr);
    const diffMs = now.getTime() - posted.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (Number.isNaN(posted.getTime())) return 'Recently';
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `Posted ${diffHours}h ago`;
    if (diffDays === 1) return 'Posted yesterday';
    return `Posted ${diffDays}d ago`;
  }

  getStatusLabel(status: string): string {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  getStatusClass(status: string): string {
    const normalized = (status ?? '').toUpperCase();
    if (normalized === 'ACCEPTED') {
      return 'bg-green-50 text-green-700 border-green-100';
    }
    if (normalized === 'REJECTED') {
      return 'bg-red-50 text-red-600 border-red-100';
    }
    return 'bg-amber-50 text-amber-700 border-amber-100';
  }

  getApplicationPreview(application: any): string {
    const text = (application?.coverLetter ?? '').trim();
    if (!text) return 'No cover letter added.';
    return text.length > 120 ? `${text.slice(0, 120)}...` : text;
  }

  private loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.recrutementService.getAllOffers(0, 999).pipe(
      catchError((err) => {
        console.log('ERROR LOADING OFFERS', err);
        return of({ content: [], totalElements: 0 });
      })
    ).subscribe({
      next: (res) => {
        const offers = this.normalizeOffers(res)
          .sort((a, b) => new Date(b.postedAt ?? 0).getTime() - new Date(a.postedAt ?? 0).getTime());

        this.latestOffers = offers.filter(offer => offer.active).slice(0, 4);
        this.dashboardStats.totalOffers = res?.totalElements ?? offers.length;
        this.dashboardStats.activeOffers = offers.filter(offer => offer.active).length;
        this.dashboardStats.totalApplications = offers.reduce((sum, offer) => sum + Number(offer.applicationCount ?? 0), 0);

        const offersWithApplications = offers.filter(offer => Number(offer.applicationCount ?? 0) > 0).slice(0, 4);

        if (offersWithApplications.length === 0) {
          this.dashboardStats.acceptanceRate = 0;
          this.loading = false;
          return;
        }

        forkJoin(
          offersWithApplications.map((offer) =>
            this.recrutementService.getApplicationsForOffer(offer.id, 0, 50).pipe(
              catchError((err) => {
                console.log(`ERROR LOADING APPLICATIONS FOR OFFER ${offer.id}`, err);
                return of({ content: [] });
              })
            )
          )
        ).subscribe({
          next: (responses) => {
            const applications = responses.flatMap((response, index) =>
              this.normalizeApplications(response, offersWithApplications[index])
            ).sort((a, b) => new Date(b.appliedAt ?? 0).getTime() - new Date(a.appliedAt ?? 0).getTime());

            this.recentApplications = applications.slice(0, 5);
            const acceptedCount = applications.filter(application => (application.status ?? '').toUpperCase() === 'ACCEPTED').length;
            const pendingCount = applications.filter(application => (application.status ?? '').toUpperCase() === 'PENDING').length;

            this.dashboardStats.acceptedApplications = acceptedCount;
            this.dashboardStats.pendingApplications = pendingCount;
            this.dashboardStats.acceptanceRate = applications.length > 0
              ? Math.round((acceptedCount / applications.length) * 100)
              : 0;
            this.loading = false;
          },
          error: (err) => {
            console.log('ERROR LOADING APPLICATIONS', err);
            this.errorMessage = 'Unable to load applications right now.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.log('ERROR LOADING RH DASHBOARD', err);
        this.errorMessage = 'Unable to load the RH dashboard right now.';
        this.loading = false;
      }
    });
  }

  private normalizeOffers(response: any): any[] {
    const offers = Array.isArray(response) ? response : (response?.content ?? []);
    return offers.map((offer: any) => ({
      ...offer,
      title: offer.title ?? '',
      location: offer.location ?? '',
      contractType: offer.contractType ?? '',
      requiredSkills: offer.requiredSkills ?? '',
      postedAt: offer.postedAt ?? '',
      active: Boolean(offer.active),
      applicationCount: Number(offer.applicationCount ?? 0)
    }));
  }

  private normalizeApplications(response: any, offer: any): any[] {
    const applications = Array.isArray(response) ? response : (response?.content ?? []);
    return applications.map((application: any) => ({
      ...application,
      jobId: offer.id,
      jobTitle: offer.title,
      status: application.status ?? 'PENDING',
      applicantUsername: application.applicantUsername ?? application.candidateUsername ?? 'Candidate',
      applicantEmail: application.applicantEmail ?? application.email ?? '',
      appliedAt: application.appliedAt ?? application.createdAt ?? '',
      coverLetter: application.coverLetter ?? ''
    }));
  }
}