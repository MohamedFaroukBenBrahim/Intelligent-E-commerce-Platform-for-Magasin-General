import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SignUp } from "../../Model/SignUp.model"
import { AuthService } from '../../Services/Auth/auth.service';
import { FormsModule } from '@angular/forms';
import { Verify } from '../../Model/Verify.model';
import { NavBarComponent } from "../../User/nav-bar/nav-bar.component";
import { FooterComponent } from "../../User/footer/footer.component";

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NavBarComponent, FooterComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  signUpData: SignUp = {
    username: '',
    email: '',
    password: ''
  }
  error: string = "";
  verificationCode: string = "";
  showVerification: boolean = false;
  constructor(private authService: AuthService, private router: Router){}
  register() {
    if (!this.signUpData.username || !this.signUpData.email || !this.signUpData.password) {
      this.error = 'All fields are required';
      return;
    }
    this.error = ''; 
    this.authService.signUp(this.signUpData).subscribe({
      next: (res) => {
        console.log('Registration successful:', res);
        this.showVerification = true;
        this.error = '';
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
  verifyAccount() {
    const verifyData: Verify = {
      email: this.signUpData.email,
      verificationCode: this.verificationCode
    };
    
    this.authService.verify(verifyData).subscribe({
      next: (res) => {
        console.log('Verification successful:', res);
        alert('Account verified successfully! You can now login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Verification error:', err);
        if (err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Verification failed. Please try again.';
        }
      }
    });
  }
  resendCode() {
    this.authService.resendVerificationCode(this.signUpData.email).subscribe({
      next: (res) => {
        alert('Verification code resent! Please check your email.');
      },
      error: (err) => {
        console.error('Resend error:', err);
        this.error = 'Failed to resend code. Please try again.';
      }
    });
  }
  signupWithGoogle() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }
}
