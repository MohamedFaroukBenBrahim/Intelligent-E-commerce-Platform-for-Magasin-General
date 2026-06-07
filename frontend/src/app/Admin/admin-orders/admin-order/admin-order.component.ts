import { Component, OnInit } from '@angular/core';
import { AdminSidebarComponent } from "../../admin-sidebar/admin-sidebar.component";
import { OrderService } from '../../../Services/Order/order.service';
import { Order } from '../../../Model/Order.model';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../Services/Auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-order',
  standalone: true,
  imports: [AdminSidebarComponent,FormsModule,CommonModule],
  templateUrl: './admin-order.component.html',
  styleUrl: './admin-order.component.css'
})
export class AdminOrderComponent implements OnInit {
  constructor(private order_service:OrderService, private authService: AuthService, private router: Router){}
  orders:Order[] = []

  
  ngOnInit(): void {
    this.order_service.getAllOrders().subscribe({
      next: (res) => {
        this.orders = res;
      },
      error: (err) => {
      }
    })
  }
  updateStatus(orderId: number, newStatus: string | undefined) {
    this.order_service.updateOrderStatus(orderId, newStatus).subscribe({
      next: (res) => console.log('Status updated'),
      error: (err) => console.log('Update failed', err)
    });
  }
}
