import { Component } from '@angular/core';
import { AuthService } from '../../Services/Auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../Services/User/user.service';
import { CartService } from '../../Services/Cart/cart.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  constructor(private authService:AuthService,private router:Router,private user_service:UserService,private cart_service: CartService){}
  
  showDropdown = false;
  username = '';
  role = '';
  profilePicture = '';
  cartCount = 0;

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
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

  ngOnInit(): void {
    if (this.isLoggedIn()) {
      this.user_service.getme().subscribe({
        next: (res) => {
          this.username = res.username;
          this.role = res.role;
          this.profilePicture = res.profilePictureUrl;
        }
      });
      this.loadCartCount();
    }
  }

  loadCartCount(): void {
    this.cart_service.getCart().subscribe({
      next: (cart) => {
        this.cartCount = (cart.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
      },
      error: () => {
        this.cartCount = 0;
      }
    });
  }

  getInitial(): string {
    return this.username ? this.username.charAt(0).toUpperCase() : 'U';
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
    console.log('dropdown:', this.showDropdown); // ← check this
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }
  

}
