import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/Auth/auth.service';
import { UserService } from '../../Services/User/user.service';
import { profile } from '../../Model/profiel.model';

@Component({
  selector: 'app-rh-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './rh-navbar.component.html',
  styleUrl: './rh-navbar.component.css'
})
export class RHNavbarComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private user_service: UserService
  ) {}

  showDropdown = false;
  me: profile = {
    id: 0, role: '', username: '',
    email: '', address: '', phone: '', profilePictureUrl: ''
  };

  ngOnInit(): void {
    this.user_service.getme().subscribe({
      next: (res) => { this.me = res; },
      error: () => {}
    });
  }

  getInitials(): string {
    return this.me.username ? this.me.username.charAt(0).toUpperCase() : 'RH';
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  // ← close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.avatar-dropdown')) {
      this.showDropdown = false;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }
}