import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/Auth/auth.service';
import { ResetPassword } from '../../Model/ResetPassword.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule,CommonModule,FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  
  constructor(private authService: AuthService,private router:Router){}
  
  ResetData : ResetPassword = {
    token: "",
    newPassword: ""
  };
  
  error:string ="";

  
  resetpassword(){
    if(!this.ResetData.newPassword || !this.ResetData.token){
      this.error = "ERROR : Password or time expiered";
    }
    this.authService.resetPassword(this.ResetData).subscribe({
      next: (res) =>{
        console.log(res);
        this.router.navigate(['/login'])
      },
      error: (err) =>{
        console.log(err);
        this.error = "ERROR: Invalid Password or time expiered";
      }
    })
  }

}
