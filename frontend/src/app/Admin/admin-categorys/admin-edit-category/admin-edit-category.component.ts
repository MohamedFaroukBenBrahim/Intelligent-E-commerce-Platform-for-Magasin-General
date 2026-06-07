import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../Services/Categorys/category.service';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { AddCategory } from '../../../Model/AddCategory.model';
import { Category } from '../../../Model/Category.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from "../../admin-sidebar/admin-sidebar.component";

@Component({
  selector: 'app-admin-edit-category',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, AdminSidebarComponent],
  templateUrl: './admin-edit-category.component.html',
  styleUrl: './admin-edit-category.component.css'
})
export class AdminEditCategoryComponent implements OnInit {
    constructor(private category_service:CategoryService,private route:ActivatedRoute,private router:Router){}
    category: Category = {
      id:0,
      name:"",
      description:"",
      createdAt:""
    };
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.getCategory(id);
      }
      });
    }
    edit() {
      if (!this.category.name || !this.category.description) {
        alert('Please fill all fields');
        return;
      }
      this.category_service.updateCategory(this.category.id,this.category).subscribe({
        next: (res) => {
          this.router.navigate(["/admin-categorys"]);
        },
        error: (err) => {
          console.log("Error details:", err);
        }
      });
    }
    getCategory(id:number){
      this.category_service.getCategoryById(id).subscribe({
        next: (res) =>{
          this.category = res;
        },
        error: (err)=>{
          console.log(err)
        }
      })
    }

}
