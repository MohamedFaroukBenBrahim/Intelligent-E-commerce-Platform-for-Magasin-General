import { Component } from '@angular/core';
import { BlogService } from '../../../Services/blog/blog.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from "../../admin-sidebar/admin-sidebar.component";
import { Blog } from '../../../Model/blog.model';

@Component({
  selector: 'app-admin-add-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminSidebarComponent],
  templateUrl: './admin-add-blog.component.html',
  styleUrl: './admin-add-blog.component.css'
})
export class AdminAddBlogComponent {
  constructor(private blogService: BlogService, private router: Router) {}

  blog = {
    title: "",
    content: "",
    type: "",
    published: false,
  };

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result ?? null;
      };
      reader.readAsDataURL(file);
    }
  }

  add() {
    if (!this.blog.title || !this.blog.content || !this.blog.type) {
      alert('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.blog.title);
    formData.append('content', this.blog.content);
    formData.append('type', this.blog.type);
    formData.append('published', String(this.blog.published));
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    console.log('Sending blog:', this.blog);

    this.blogService.addBlog(formData).subscribe({
      next: (res) => {
        if (res) {
          console.log('Success:', res);
        } else {
          console.log('Success: no response body (backend returned null or 204)');
        }
        // navigate back to list regardless; backend may return empty body.
        this.router.navigate(["/admin-blog"]);
      },
      error: (err) => {
        console.log("Error:", err);
        alert('Failed to add blog');
      }
    });
  }
}
