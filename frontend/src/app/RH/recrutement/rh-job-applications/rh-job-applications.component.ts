import { Component, OnInit } from '@angular/core';
import { RHNavbarComponent } from "../../rh-navbar/rh-navbar.component";
import { RecrutementService } from '../../../Services/recrutement/recrutement.service';
import { JobOfferResponseDto } from '../../../Model/JobOfferResponse.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rh-job-applications',
  standalone: true,
  imports: [RHNavbarComponent, CommonModule, RouterLink, FormsModule],
  templateUrl: './rh-job-applications.component.html',
  styleUrl: './rh-job-applications.component.css'
})
export class RhJobApplicationsComponent implements OnInit {
  constructor(
    private recrutement_service: RecrutementService,
    private route: ActivatedRoute
  ) {}

  loading = true;
  applications: any[] = [];
  selectedStatus: 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' = 'ALL';
  job: JobOfferResponseDto = {
    id: 0,
    title: '', 
    description: '', 
    location: '',
    contractType: '', 
    requiredSkills: '', 
    active: false,
    postedAt: '', 
    updatedAt: '', 
    postedByUsername: '', 
    applicationCount: 0
  };

  get filteredApplications(): any[] {
    if (this.selectedStatus === 'ALL') {
      return this.applications;
    }
    return this.applications.filter(app => app.status === this.selectedStatus);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.getjob(id);
      this.loadApplications(id);
    }
  }

  getjob(id: number): void {
    this.recrutement_service.getOfferById(id).subscribe({
      next: (res) => { 
        this.job = res; this.loading = false; 
      },
      error: (err) => { 
        console.log(err); this.loading = false; 
      }
    });
  }

  loadApplications(id: number): void {
    this.recrutement_service.getApplicationsForOffer(id).subscribe({
      next: (res) => { 
        this.applications = res?.content ?? []; 
      },
      error: (err) => {
         console.log(err); 
        }
    });
  }

  updateStatus(applicationId: number, status: string): void {
    this.recrutement_service.updateApplicationStatus(applicationId, status).subscribe({
      next: (res) => {
        const index = this.applications.findIndex(a => a.id === applicationId);
        if (index !== -1) this.applications[index].status = status;
      },
      error: (err) => console.log(err)
    });
  }

  onStatusFilterChange(status: 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'): void {
    this.selectedStatus = status;
  }

  downloadingCvFor: number | null = null;

  downloadCv(applicationId: number): void {
    this.downloadingCvFor = applicationId;
    this.recrutement_service.getCvByApplicationId(applicationId).subscribe({
      next: (res) => {
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `application_${applicationId}_cv.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingCvFor = null;
      },
      error: (err) => {
        console.log(err);
        this.downloadingCvFor = null;
      }
    });
  }
}