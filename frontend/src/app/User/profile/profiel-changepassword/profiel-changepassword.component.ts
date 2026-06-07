import { Component, OnInit } from '@angular/core';
import { FooterComponent } from "../../footer/footer.component";
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { ProfileSidebarComponent } from "../profile-sidebar/profile-sidebar.component";
import { UserService } from '../../../Services/User/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../Services/Auth/auth.service';
import { ForgotPassword } from '../../../Model/ForgotPassword.model';
import { ResetPassword } from '../../../Model/ResetPassword.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profiel-changepassword',
  standalone: true,
  imports: [FooterComponent, NavBarComponent, ProfileSidebarComponent, FormsModule, CommonModule],
  templateUrl: './profiel-changepassword.component.html',
  styleUrl: './profiel-changepassword.component.css'
})
export class ProfielChangepasswordComponent implements OnInit {
  showSuccessAlert = false;
  showErrorAlert = false;
  codeSending = false;
  step = 1;
  error = '';
  Emailuser = '';

  ResetData: ResetPassword = {
    token: '',
    newPassword: ''
  };

  constructor(
    private user_service: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user_service.getme().subscribe({
      next: (res) => { this.Emailuser = res.email; },
      error: () => { console.log('ERROR LOADING PROFILE'); }
    });
  }

  sendCode(): void {
    this.codeSending = true;
    const forgotPasswordData: ForgotPassword = { email: this.Emailuser };

    this.authService.forgotPassword(forgotPasswordData).subscribe({
      next: () => {
        this.codeSending = false;
        setTimeout(() => {
          this.step = 2; // show inputs after short delay
        }, 1500);
      },
      error: (err) => {
        this.codeSending = false;
        this.error = 'Failed to send code. Please try again.';
        console.error(err);
      }
    });
  }

  resetpassword(): void {
    this.error = '';
    if (!this.ResetData.newPassword || !this.ResetData.token) {
      this.error = 'Please fill in both the code and new password.';
      return;
    }

    this.authService.resetPassword(this.ResetData).subscribe({
      next: () => {
        this.showSuccessAlert = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: () => {
        this.error = 'Invalid code or it has expired. Please try again.';
      }
    });
  }
}