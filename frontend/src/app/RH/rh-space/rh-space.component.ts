import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { profile } from '../../Model/profiel.model';
import { RecrutementService } from '../../Services/recrutement/recrutement.service';
import { UserService } from '../../Services/User/user.service';
import { RHNavbarComponent } from '../rh-navbar/rh-navbar.component';

@Component({
  selector: 'app-rh-space',
  standalone: true,
  imports: [CommonModule, RouterLink, RHNavbarComponent],
  templateUrl: './rh-space.component.html',
  styleUrl: './rh-space.component.css'
})
export class RHSpaceComponent implements OnInit {
  constructor(
    private recrutementService: RecrutementService,
    private userService: UserService
  ) {}

  loading = true;
  errorMessage = '';

  me: profile = {
    id: 0,
    role: '',
    username: '',
    email: '',
    address: '',
    phone: '',
    profilePictureUrl: ''
  };

  stats = {
    totalOffers: 0,
    activeOffers: 0,
    closedOffers: 0,
    totalApplications: 0,
    acceptedApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    acceptanceRate: 0
  };

  recentOffers: any[] = [];
  recentApplications: any[] = [];

  ngOnInit(): void {
    this.userService.getme().subscribe({
      next: (res) => { this.me = res; },
      error: () => { /* keep the page usable */ }
    });

    this.loadDashboard();
  }

  getInitials(): string {
    return this.me.username ? this.me.username.charAt(0).toUpperCase() : 'RH';
  }

  getStatusLabel(status: string): string {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  getTimeAgo(dateStr: string): string {
    if (!dateStr) return 'Recently';
    const posted = new Date(dateStr);
    if (Number.isNaN(posted.getTime())) return 'Recently';

    const diffMs = Date.now() - posted.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  }

  getPercent(value: number, total: number): number {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  private loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      offers: this.recrutementService.getAllOffers(0, 9999).pipe(
        catchError(() => of({ content: [], totalElements: 0 }))
      ),
      applications: this.recrutementService.getAllApplications(0, 9999).pipe(
        catchError(() => of({ content: [], totalElements: 0 }))
      )
    }).subscribe({
      next: ({ offers, applications }) => {
        const normalizedOffers = this.unwrapContent(offers).map((offer: any) => ({
          ...offer,
          title: offer.title ?? '',
          location: offer.location ?? '',
          contractType: offer.contractType ?? '',
          active: Boolean(offer.active),
          applicationCount: Number(offer.applicationCount ?? 0),
          postedAt: offer.postedAt ?? ''
        }));

        const normalizedApplications = this.unwrapContent(applications).map((application: any) => ({
          ...application,
          applicantUsername: application.applicantUsername ?? application.candidateUsername ?? 'Candidate',
          applicantEmail: application.applicantEmail ?? application.email ?? '',
          jobTitle: application.jobTitle ?? application.offerTitle ?? application.title ?? 'Job offer',
          status: (application.status ?? 'PENDING').toUpperCase(),
          appliedAt: application.appliedAt ?? application.createdAt ?? '',
          coverLetter: application.coverLetter ?? ''
        }));

        const acceptedApplications = normalizedApplications.filter((app) => app.status === 'ACCEPTED').length;
        const pendingApplications = normalizedApplications.filter((app) => app.status === 'PENDING').length;
        const rejectedApplications = normalizedApplications.filter((app) => app.status === 'REJECTED').length;

        this.stats = {
          totalOffers: normalizedOffers.length,
          activeOffers: normalizedOffers.filter((offer) => offer.active).length,
          closedOffers: normalizedOffers.filter((offer) => !offer.active).length,
          totalApplications: normalizedApplications.length,
          acceptedApplications,
          pendingApplications,
          rejectedApplications,
          acceptanceRate: normalizedApplications.length > 0
            ? Math.round((acceptedApplications / normalizedApplications.length) * 100)
            : 0
        };

        this.recentOffers = normalizedOffers
          .sort((a, b) => new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime())
          .slice(0, 4);

        this.recentApplications = normalizedApplications
          .sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime())
          .slice(0, 6);

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load the RH dashboard right now.';
        this.loading = false;
      }
    });
  }

  private unwrapContent(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }
    return response?.content ?? [];
  }

}
