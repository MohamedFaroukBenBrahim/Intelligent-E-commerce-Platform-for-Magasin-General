import { Component } from '@angular/core';
import { FooterComponent } from "../../footer/footer.component";
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { RouterLink } from '@angular/router';
import { ProfileSidebarComponent } from "../profile-sidebar/profile-sidebar.component";
import { UserService } from '../../../Services/User/user.service';
import { ProductsService } from '../../../Services/Products/products.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../Services/Order/order.service';
import { error } from 'three';

@Component({
  selector: 'app-profiel-orderhistory',
  standalone: true,
  imports: [FooterComponent, NavBarComponent, ProfileSidebarComponent,FormsModule,CommonModule],
  templateUrl: './profiel-orderhistory.component.html',
  styleUrl: './profiel-orderhistory.component.css'
})
export class ProfielOrderhistoryComponent {
  orders: any[] = [];
  loading = true;
  expandedOrders: { [key: number]: boolean } = {};

  constructor(private user_service: UserService, private products_service: ProductsService,private order_service : OrderService) {}

  ngOnInit(): void {
    this.user_service.getmyorder().subscribe({
      next: (res) => {
        this.loading = false
        this.orders = res;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleOrder(id: number): void {
    this.expandedOrders[id] = !this.expandedOrders[id];
  }
  cancelorder(id:number,status : "CANCELLED"): void{
    confirm("are you sure you want to cancle this order !")
    this.order_service.updateOrderStatus(id,status).subscribe({
      next: (res)=>{
        window.location.reload()
      },
      error: ()=>{
        console.log("ERROR IN CANCELING ORDER")
      }
    });
  }
}
