import { Component } from '@angular/core';
import { profile } from '../../../Model/profiel.model';
import { UserService } from '../../../Services/User/user.service';
import { Route, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../Services/Auth/auth.service';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [RouterLink,CommonModule,FormsModule,RouterLinkActive],
  templateUrl: './profile-sidebar.component.html',
  styleUrl: './profile-sidebar.component.css'
})
export class ProfileSidebarComponent {
  constructor(private user_service:UserService,private authService:AuthService,private router:Router){}
  me:profile={
    id: 0,
    role: "",
    username: '',
    email: '',
    address: '',
    phone: '',
    profilePictureUrl: ''
  }
  
  ngOnInit(): void {
    this.user_service.getme().subscribe({
      next: (res)=>{
        this.me = res
      },
      error: (res)=>{
        console.log("ERROR LOADING PROFILE")
      }
    })
  }

  updatepicture(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.user_service.updateprofielpicture(file).subscribe({
      next: (res) => {
        this.me.profilePictureUrl  = res.profilePictureUrl;
        console.log("Picture updated successfully");
      },
      error: (err) => {
        console.log("ERROR updating profile picture", err);
      }
    });
  }
    logout(): void {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logged out successfully from backend');
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Backend logout error:', error);
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }  
}
