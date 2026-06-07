import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../Services/Order/order.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './payment-result.component.html',
  styleUrl: './payment-result.component.css'
})
export class PaymentResultComponent implements OnInit {
  success = false;
  orderId: number = 0;

  constructor(private route: ActivatedRoute,private router: Router,private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = +params['orderId'];
      const transactionId = params['transactionId'];
      this.success = params['success'] === 'true';
      this.orderService.confirmPayment(this.orderId, transactionId, this.success).subscribe();
    });
  }

  goHome() { this.router.navigate(['/']); }
  goCheckout() { this.router.navigate(['/checkout']); }

}
