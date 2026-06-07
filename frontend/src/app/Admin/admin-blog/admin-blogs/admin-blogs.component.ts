import { Component } from '@angular/core';
import { AdminSidebarComponent } from "../../admin-sidebar/admin-sidebar.component";
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../Services/blog/blog.service';
import { Blog } from '../../../Model/blog.model';

@Component({
  selector: 'app-admin-blogs',
  standalone: true,
  imports: [AdminSidebarComponent,RouterLink,CommonModule,FormsModule],
  templateUrl: './admin-blogs.component.html',
  styleUrl: './admin-blogs.component.css'
})
export class AdminBlogsComponent {
  constructor(private Blog_service:BlogService){}
  Bloglist: Blog[] = [];
  searchtext:string ="";
  selectedType: string = 'all';
  types: string[] = [];
  ngOnInit(): void {
    this.loadBlogs();
    this.search();
  }

  loadBlogs() {
    this.Blog_service.getAllBlogs().subscribe({
      next: (res) => { 
        this.Bloglist = res ?? []; 
        // populate unique types for filter
        this.types = Array.from(new Set((res ?? []).map(b => b.type).filter(Boolean)));
      },
      error: (err) => console.log("ERROR", err)
    });
  }
  delete(id :number){
    this.Blog_service.deleteBlog(id).subscribe({
      next: (res) => {
        console.log('Delete success')
        this.loadBlogs();
      },
      error: (err) => {
        console.log(err)
        alert('ERROR')
      }
    })
  }
  publishe(id:number){
    this.Blog_service.publishBlog(id).subscribe({
      next: (res) => {
        console.log('Delete success')
        this.loadBlogs();
      },
      error: (err) => {
        console.log(err)
        alert('ERROR')
      }
    })
  }
  unpublishe(id:number){
    this.Blog_service.unpublishBlog(id).subscribe({
      next: (res) => {
        console.log('Delete success')
          this.loadBlogs();
      },
      error: (err) => {
        console.log(err)
        alert('ERROR')
      }
    })
  }
  search(){
      const typeParam = this.selectedType && this.selectedType !== 'all' ? this.selectedType : undefined;
      this.Blog_service.getsearchedBlogs(this.searchtext, typeParam).subscribe({
        next:(res) =>{
          this.Bloglist = res.content
        },
        error:(err) =>{
          console.log("ERROR search")
        }
      })
  }
}
