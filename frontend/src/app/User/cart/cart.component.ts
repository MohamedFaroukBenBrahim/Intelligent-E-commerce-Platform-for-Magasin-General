import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { FooterComponent } from "../footer/footer.component";
import { CartService } from '../../Services/Cart/cart.service';
import { Cart } from '../../Model/Cart.model';
import { CommonModule } from '@angular/common';
import { CartItemDetailed } from '../../Model/CartItemDetailed.model';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NavBarComponent, FooterComponent, CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  constructor(private cart_service: CartService) {}

  cart: Cart = { id: 0, items: [] };
  items: CartItemDetailed[] = [];
  subtotal = 0;

  ngOnInit(): void {
    this.getCart();
  }

  getCart() {
    this.cart_service.getCart().subscribe({
      next: (res) => {
        this.cart = res;
        this.loadItems();
      },
      error: (err) => console.log(err)
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

  removeItem(item: CartItemDetailed) {
    this.cart_service.removeCartItem(item.cartItemId).subscribe({  // use cartItemId not product.id
      next: () => {
        this.items = this.items.filter(i => i.cartItemId !== item.cartItemId);
        this.calculateSubtotal();
      },
      error: err => console.log(err)
    });
  }

  updateQuantity(item: CartItemDetailed, qty: number) {
    if (qty < 1) return;
    this.cart_service.updateCartItem(item.cartItemId, qty).subscribe({
      next: () => {
        item.quantity = qty;
        item.total = item.product.discount > 0
          ? (item.product.price - (item.product.discount * item.product.price) / 100) * qty
          : item.product.price * qty;
        this.calculateSubtotal();
      },
      error: err => console.log(err)
    });
  }
}