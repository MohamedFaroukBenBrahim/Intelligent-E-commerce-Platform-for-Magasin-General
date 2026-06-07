import { Component } from '@angular/core';
import { Route, Router, RouterLink } from "@angular/router";
import { AuthService } from '../../Services/Auth/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent {
  constructor(private authService:AuthService,private router:Router){}
  logout(): void {
    console.log(localStorage.getItem('token'))
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
