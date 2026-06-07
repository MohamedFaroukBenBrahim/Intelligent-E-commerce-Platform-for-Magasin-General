import { Component, OnInit } from '@angular/core';
import { AdminSidebarComponent } from "../../admin-sidebar/admin-sidebar.component";
import { ProductsService } from '../../../Services/Products/products.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../../Model/Product.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-restock',
  standalone: true,
  imports: [AdminSidebarComponent,FormsModule,CommonModule,RouterLink],
  templateUrl: './admin-restock.component.html',
  styleUrl: './admin-restock.component.css'
})
export class AdminRestockComponent implements OnInit {

  constructor(private product_service: ProductsService,private route: ActivatedRoute,private router: Router) {}

  product: Product = {
    id: 0,
    name: '',
    description: '',
    state: '',
    price: 0,
    discount: 0,
    createdAt: '',
    rate: 0,
    quantity: 0,
    category: null
  };

  adjustment: number = 0;
  reason: string = '';
  showSuccess: boolean = false;
  errorMsg: string = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.product_service.getProductById(id).subscribe({
        next: (res) => { this.product = res; },
        error: (err) => console.error(err)
      });
    }
  }

  adjustStock(): void {
    this.errorMsg = '';
    this.showSuccess = false;

    this.product_service.adjustStock(this.product.id, this.adjustment, this.reason).subscribe({
      next: (updated) => {
        this.product.quantity = updated.quantity;
        this.adjustment = 0;
        this.reason = '';
        this.showSuccess = true;
        setTimeout(() => this.router.navigate(['/admin-products']), 1500);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to adjust stock. Please try again.';
      }
    });
  }
}
