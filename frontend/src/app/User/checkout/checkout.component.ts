import { Component } from '@angular/core';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { FooterComponent } from "../footer/footer.component";
import { OrderService } from '../../Services/Order/order.service';
import { UserService } from '../../Services/User/user.service';
import { CartService } from '../../Services/Cart/cart.service';
import { CartItemDetailed } from '../../Model/CartItemDetailed.model';
import { Cart } from '../../Model/Cart.model';
import { KonnectPayment } from '../../Model/KonnectPayment.model';
import { CommonModule } from '@angular/common';
import { Route, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [NavBarComponent, FooterComponent,CommonModule,FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  constructor(private order_service: OrderService,private cart_service: CartService,private router: Router,private userService:UserService ) {}
  private isSubmitting = false;
  // Shipping fields
  Street: string = '';
  Apertment: string = '';
  City: string = '';
  State: string = '';
  Postal: string = '';

  // Payment fields
  phoneNumber: string = '';
  firstName: string = '';
  lastName: string = '';
  email: string = '';

  // State
  cart: Cart = { id: 0, items: [] };
  items: CartItemDetailed[] = [];
  subtotal = 0;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.getCart();
    this.prefillUserInfo(); // pre-fill from token if available
  }

  prefillUserInfo() {
    this.userService.getme().subscribe({
    next: (user) => {
      console.log(user)
      this.email = user.email ?? '';
      this.phoneNumber = user.phone ?? '';
    },
    error: (err) => console.log('Could not prefill user info', err)
  });
}

  getCart() {
    this.cart_service.getCart().subscribe({
      next: (res) => { this.cart = res; this.loadItems(); },
      error: (err) => { console.log(err); }
    });
  }

  private loadItems() {
    this.items = [];
    if (!this.cart.items || this.cart.items.length === 0) return;
    this.items = this.cart.items.map(ci => ({
      cartItemId: ci.id,
      product: ci.product,
      quantity: ci.quantity,
      total: ci.product.discount > 0
        ? (ci.product.price - (ci.product.discount * ci.product.price) / 100) * ci.quantity
        : ci.product.price * ci.quantity
    }));
    this.calculateSubtotal();
  }

  private calculateSubtotal() {
    this.subtotal = this.items.reduce((sum, i) => sum + i.total, 0);
  }

  private buildShippingAddress(): string {
    const street = this.Street.trim();
    const apartment = this.Apertment.trim();
    const city = this.City.trim();
    const state = this.State.trim();
    const postal = this.Postal.trim();

    if (street && city && state && postal) {
      const streetLine = apartment ? `${apartment}, ${street}` : street;
      return `${streetLine}, ${state}: ${city}/${postal}`;
    }

    return '';
  }

  placeOrder(form: NgForm) {
    if (form.invalid || this.isSubmitting) return;
    const address = this.buildShippingAddress();

    if (!address) {
      this.errorMessage = 'Shipping address is required. Please add one below or save a default address on your profile.';
      return;
    }

    this.isSubmitting = true;      
    this.isLoading = true;
    this.errorMessage = '';

    this.order_service.placeOrder(address, 'KONNECT').subscribe({
      next: (order) => {
        const paymentDto = {
          orderId: order.id,
          phoneNumber: this.phoneNumber,
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email
        };

        this.order_service.initiateKonnectPayment(paymentDto).subscribe({
          next: (res) => {
            console.log(res)
            this.isLoading = false;
            if (res.paymentUrl) {
              window.location.href = res.paymentUrl;
            } else {
              this.errorMessage = 'Payment URL not received.';
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.isSubmitting = false;      
            this.errorMessage = 'Payment initiation failed.';
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.isSubmitting = false;      
        this.errorMessage = err.error ?? 'Failed to place order.';
        console.error(err);
      }
    });
  }
}
