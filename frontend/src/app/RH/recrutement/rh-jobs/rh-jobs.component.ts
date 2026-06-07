import { Component, OnInit } from '@angular/core';
import { RHNavbarComponent } from "../../rh-navbar/rh-navbar.component";
import { RouterLink } from "@angular/router";
import { RecrutementService } from '../../../Services/recrutement/recrutement.service';
import { JobOfferResponseDto } from '../../../Model/JobOfferResponse.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rh-jobs',
  standalone: true,
  imports: [RHNavbarComponent, RouterLink,FormsModule,CommonModule],
  templateUrl: './rh-jobs.component.html',
  styleUrl: './rh-jobs.component.css'
})
export class RHJobsComponent implements OnInit {
  constructor(private recrutement_service: RecrutementService) {}

  listJobOffers: JobOfferResponseDto[] = [];
  searchtext: string = '';
  loading = true;

  ngOnInit(): void {
    this.getjobs();
  }

  getjobs(): void {
    this.recrutement_service.getAllOffers().subscribe({
      next: (res) => {
        this.listJobOffers = res.content;
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      }
    });
  }

  getSkills(skills: string): string[] {
    if (!skills) return [];
    return skills.split(',').map(s => s.trim()).filter(s => s);
  }

  getTimeAgo(dateStr: string): string {
    const now = new Date();
    const posted = new Date(dateStr);
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted yesterday';
    return `Posted ${diffDays} days ago`;
  }

  delete(id: number): void {
    if(!confirm("are you sure you want delete job ?")) return;
    this.recrutement_service.deleteOffer(id).subscribe({
      next: () => this.getjobs(),
      error: (err) => console.log(err)
    });
  }
}