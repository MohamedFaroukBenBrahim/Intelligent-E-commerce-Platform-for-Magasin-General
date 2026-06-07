import { Component } from '@angular/core';
import { RHNavbarComponent } from "../../rh-navbar/rh-navbar.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecrutementService } from '../../../Services/recrutement/recrutement.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JobOfferDto } from '../../../Model/JobOffer.model';
import { JobOfferResponseDto } from '../../../Model/JobOfferResponse.model';

@Component({
  selector: 'app-rh-editjob',
  standalone: true,
  imports: [RHNavbarComponent,CommonModule,FormsModule,RouterLink],
  templateUrl: './rh-editjob.component.html',
  styleUrl: './rh-editjob.component.css'
})
export class RhEditjobComponent {
 constructor(private recrutement_service: RecrutementService, private router: Router,private route: ActivatedRoute ) {}

  job:JobOfferResponseDto = {
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

  showSuccess = false;
  showError = false;
  errorMsg = '';
  loading = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')); // ← get id from URL
    if (id) {
      this.getjob(id);
    }
  }

  getjob(id:number): void {
    this.recrutement_service.getOfferById(id).subscribe({
      next: (res) => {
        this.job = res
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      }
    });
  }
  submit(): void {
    if (!this.job.title || !this.job.description || !this.job.location || !this.job.contractType) {
      this.errorMsg = 'Veuillez remplir tous les champs obligatoires.';
      this.showError = true;
      return;
    }

    this.loading = true;
    this.showError = false;

    this.recrutement_service.updateOffer(this.job.id,this.job).subscribe({
      next: (res) => {
        console.log(res)
        this.loading = false;
        this.showSuccess = true;
        setTimeout(() => this.router.navigate(['/RH-jobs']), 1500);
      },
      error: (err) => {
        console.log(err)
        this.loading = false;
        this.errorMsg = err.error?.message || 'Une erreur est survenue.';
        this.showError = true;
      }
    });
  }
  toggleActive(): void {
    this.job.active = !this.job.active;
    this.recrutement_service.updateOffer(this.job.id, this.job).subscribe({
      next: (res) => {
        this.job = res;
        console.log('Status updated:', this.job.active ? 'Active' : 'Inactive');
      },
      error: (err) => {
        this.job.active = !this.job.active; 
        this.errorMsg = 'Failed to update status.';
        this.showError = true;
      }
    });
  }
}
