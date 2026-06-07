import { Component, OnInit } from '@angular/core';
import { FooterComponent } from "../../footer/footer.component";
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecrutementService } from '../../../Services/recrutement/recrutement.service';
import { UserService } from '../../../Services/User/user.service';
import { JobOfferResponseDto } from '../../../Model/JobOfferResponse.model';

@Component({
  selector: 'app-apply-job',
  standalone: true,
  imports: [FooterComponent, NavBarComponent,RouterLink,CommonModule,FormsModule],
  templateUrl: './apply-job.component.html',
  styleUrl: './apply-job.component.css'
})
export class ApplyJobComponent implements OnInit {
  constructor(private route: ActivatedRoute,private router: Router,private applicationService: RecrutementService,private profileService: UserService,private jobService: RecrutementService) {}

  job: JobOfferResponseDto | null = null;
  coverLetter = '';
  hasCv = false;
  loading = true;
  submitting = false;
  showSuccess = false;
  showError = false;
  errorMsg = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Load job and profile in parallel
    this.jobService.getOfferById(id).subscribe({
      next: (res) => { this.job = res; }
    });

    this.profileService.getMyProfile().subscribe({
      next: (res) => {
        this.hasCv = !!res.cvUrl;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  submit(): void {
    if (!this.hasCv) {
      this.errorMsg = 'You must upload a CV before applying.';
      this.showError = true;
      return;
    }

    this.submitting = true;
    this.showError = false;

    this.applicationService.apply(this.job!.id, { coverLetter: this.coverLetter }).subscribe({
      next: () => {
        this.submitting = false;
        this.showSuccess = true;
        setTimeout(() => this.router.navigate(['/listProducts']), 2000);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err.error || 'Failed to submit application.';
        this.showError = true;
      }
    });
  }
}