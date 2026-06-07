import { Component } from '@angular/core';
import { RHNavbarComponent } from '../../rh-navbar/rh-navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecrutementService } from '../../../Services/recrutement/recrutement.service';
import { Router, RouterLink } from '@angular/router';
import { JobOfferDto } from '../../../Model/JobOffer.model';

@Component({
  selector: 'app-rh-addjob',
  standalone: true,
  imports: [RHNavbarComponent,CommonModule,FormsModule,RouterLink],
  templateUrl: './rh-addjob.component.html',
  styleUrl: './rh-addjob.component.css'
})
export class RHAddjobComponent {
  constructor(private recrutement_service: RecrutementService, private router: Router) {}

  job: JobOfferDto = {
    title: '',
    description: '',
    location: '',
    contractType: '',
    requiredSkills: ''
  };

  showSuccess = false;
  showError = false;
  errorMsg = '';
  loading = false;

  submit(): void {
    if (!this.job.title || !this.job.description || !this.job.location || !this.job.contractType) {
      this.errorMsg = 'Veuillez remplir tous les champs obligatoires.';
      this.showError = true;
      return;
    }

    this.loading = true;
    this.showError = false;

    this.recrutement_service.createOffer(this.job).subscribe({
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
}
