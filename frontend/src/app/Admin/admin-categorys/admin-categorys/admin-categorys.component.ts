import { Component, OnInit } from '@angular/core';
import { Category } from '../../../Model/Category.model';
import { CategoryService } from '../../../Services/Categorys/category.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";
import { AdminSidebarComponent } from "../../admin-sidebar/admin-sidebar.component";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-admin-categorys',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminSidebarComponent, FormsModule],
  templateUrl: './admin-categorys.component.html',
  styleUrl: './admin-categorys.component.css'
})
export class AdminCategorysComponent implements OnInit {
  constructor(private category_service:CategoryService){}
  categorylist: Category[] = [];
  searchtext: string = "";

  ngOnInit(): void {
    this.category_service.getAllCategorys().subscribe({
      next: (res) => {
        this.categorylist = res;
        console.log("list working")
      },
      error: (err) =>{
        console.log("ERROR")
      }
    })
    this.search()
  }
  delete(id :number){
    this.category_service.deleteCategory(id).subscribe({
        next: (res) => {
          console.log('Delte succes')
          this.ngOnInit();
        },
        error: (err) => {
          console.log(err)
          alert('ERROR')
        }
    })
  }
  search(){
    this.category_service.getsearchedCategory(this.searchtext).subscribe({
      next: (res) => {
        console.log("worked")
        this.categorylist = res.content
      },
      error: (err) =>{
        console.log("ERROR")
      }
    })
  }

}
