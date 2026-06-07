import { Component } from '@angular/core';
import { Category } from '../../../Model/Category.model';
import { CategoryService } from '../../../Services/Categorys/category.service';
import { AddCategory } from '../../../Model/AddCategory.model';
import { FormsModule, NgModel } from "@angular/forms";
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminHomeComponent } from "../../admin-home/admin-home.component";
import { AdminSidebarComponent } from "../../admin-sidebar/admin-sidebar.component";

@Component({
  selector: 'app-admin-add-category',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, AdminSidebarComponent],
  templateUrl: './admin-add-category.component.html',
  styleUrl: './admin-add-category.component.css'
})
export class AdminAddCategoryComponent {
  constructor(private category_service:CategoryService,private router:Router){}
  category: AddCategory = {
    name:"",
    description:""
  };

  add() {
    if (!this.category.name || !this.category.description) {
      alert('Please fill all fields');
      return;
    }
    this.category_service.addCategory(this.category).subscribe({
      next: (res) => {
        this.router.navigate(["/admin-categorys"]);
      },
      error: (err) => {
        console.log("Error details:", err);
      }
    });
  }
  

}
