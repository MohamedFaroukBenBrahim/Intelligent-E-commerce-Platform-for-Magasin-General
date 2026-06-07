import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router,RouterLink } from "@angular/router";
import { AuthService } from '../../Services/Auth/auth.service';
import { Login } from '../../Model/Login.model';
import { ForgotPassword } from '../../Model/ForgotPassword.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavBarComponent } from "../../User/nav-bar/nav-bar.component";
import { FooterComponent } from "../../User/footer/footer.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NavBarComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      this.router.navigate(['']); 
    }
  }
  loginData: Login = {
    email: '',
    password: ''
  };
  error: string = '';
  showForgotPassword: boolean = false;
  forgotPasswordEmail: string = '';
  forgotPasswordSuccess: string = '';
  showSignupPopup: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.error ="";
    if ( !this.loginData.email || !this.loginData.password) {
      this.error = 'All fields are required';
      return;
    }
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        const tokenPayload = JSON.parse(atob(res.token.split('.')[1]));
        console.log(tokenPayload);
        const role = tokenPayload.role[0]; 
        localStorage.setItem('role', role);
        console.log('User role:', role);
        if (role === 'ROLE_ADMIN') {
          this.router.navigate(['/admin-home']);
        } else if(role ==='ROLE_RH') {
          this.router.navigate(['/RH-home']);
        }else{
          this.showSignupPopup = true;
          setTimeout(() => {
            this.showSignupPopup = false;
            this.router.navigate(['']);
          }, 2500);
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Invalid email or password';
      }
    });
  }
  loginWithGoogle() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  toggleForgotPassword() {
    this.showForgotPassword = !this.showForgotPassword;
    this.error = '';
    this.forgotPasswordSuccess = '';
    this.forgotPasswordEmail ="";
  }

  forgotPassword() {
    this.error = '';
    this.forgotPasswordSuccess = '';
    if (!this.forgotPasswordEmail) {
      this.error = 'Please enter your email';
      return;
    }
    const forgotPasswordData: ForgotPassword = {
      email: this.forgotPasswordEmail
    };
    this.authService.forgotPassword(forgotPasswordData).subscribe({
      next: (res) => {
        console.log(res);
        this.forgotPasswordSuccess = 'Password reset code sent to your email. Check your inbox!';
        this.error = '';
        setTimeout(() => {
          this.router.navigate(['/reset-password']);
        }, 2000);
      },
      error: (err) => {
        console.error(err);
        this.error = err.error.error || 'Failed to send reset code';
        this.forgotPasswordSuccess = '';
      }
    });
  }
}
