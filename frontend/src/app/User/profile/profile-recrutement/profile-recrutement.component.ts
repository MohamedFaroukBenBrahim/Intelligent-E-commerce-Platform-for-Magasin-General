import { Component } from '@angular/core';
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { ProfileSidebarComponent } from "../profile-sidebar/profile-sidebar.component";
import { FooterComponent } from "../../footer/footer.component";
import { UserService } from '../../../Services/User/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CandidateProfileResponseDto } from '../../../Model/CandidateProfileResponseDto.model';
import { RecrutementService } from '../../../Services/recrutement/recrutement.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-recrutement',
  standalone: true,
  imports: [NavBarComponent, ProfileSidebarComponent, FooterComponent,FormsModule,CommonModule,RouterLink],
  templateUrl: './profile-recrutement.component.html',
  styleUrl: './profile-recrutement.component.css'
})
export class ProfileRecrutementComponent {
  constructor(private profile_Service: UserService,private recrutementservice:RecrutementService) {}
  
  applications: any[] = [];
  loadingApplications = true;
  
  profile: CandidateProfileResponseDto = {
    id: 0,
    bio: '', 
    title: '', 
    cvUrl: '', 
    createdAt: '', 
    updatedAt: ''
  };

  bio = '';
  title = '';
  selectedFile: File | null = null;
  fileName = '';

  loading = true;
  uploading = false;
  saving = false;
  showSuccess = false;
  showCvSuccess = false;
  showError = false;
  errorMsg = '';

  ngOnInit(): void {
    this.profile_Service.getMyProfile().subscribe({
      next: (res) => {
        this.profile = res;
        this.bio = res.bio || '';
        this.title = res.title || '';
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.loadMyApplications();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.fileName = file.name;
    } else {
      this.errorMsg = 'Only PDF files are accepted.';
      this.showError = true;
    }
  }

  uploadCv(): void {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.profile_Service.uploadCv(this.selectedFile).subscribe({
      next: (res) => {
        this.profile = res;
        this.uploading = false;
        this.showCvSuccess = true;
        this.selectedFile = null;
        this.fileName = '';
        setTimeout(() => this.showCvSuccess = false, 3000);
      },
      error: (err) => {
        this.uploading = false;
        this.errorMsg = err.error?.message || 'Failed to upload CV.';
        this.showError = true;
      }
    });
  }

  saveProfile(): void {
    this.saving = true;
    this.showError = false;
    this.profile_Service.updateProfile(this.bio, this.title).subscribe({
      next: (res) => {
        this.profile = res;
        this.saving = false;
        this.showSuccess = true;
        setTimeout(() => this.showSuccess = false, 3000);
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'Failed to save profile.';
        this.showError = true;
      }
    });
  }


  loadMyApplications(): void {
    this.recrutementservice.getMyApplications().subscribe({
      next: (res) => {
        this.applications = res.content;
        this.loadingApplications = false;
      },
      error: (err) => {
        console.log(err);
        this.loadingApplications = false;
      }
    });
  }
}
