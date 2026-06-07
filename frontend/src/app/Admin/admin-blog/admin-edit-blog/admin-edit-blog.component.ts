import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BlogService } from '../../../Services/blog/blog.service';
import { Blog } from '../../../Model/blog.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from "../../admin-sidebar/admin-sidebar.component";

@Component({
  selector: 'app-admin-edit-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminSidebarComponent],
  templateUrl: './admin-edit-blog.component.html',
  styleUrl: './admin-edit-blog.component.css'
})
export class AdminEditBlogComponent {
  blogId!: number;
  blog: Blog | null = null;
  loading = true;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  hasExistingImage = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.blogId = params['id'];
      this.loadBlog();
    });
  }

  loadBlog() {
    this.blogService.getBlogById(this.blogId).subscribe({
      next: (res) => {
        this.blog = res;
        // Set image preview from URL if exists
        if (res.imageUrl) {
          this.imagePreview = res.imageUrl;
          this.hasExistingImage = true;
        }
        this.loading = false;
        console.log('Blog loaded:', res);
      },
      error: (err) => {
        console.log('Error loading blog:', err);
        this.loading = false;
        alert('Failed to load blog');
        this.router.navigate(['/admin-blog']);
      }
    });
  }

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

  update() {
    if (!this.blog || !this.blog.title || !this.blog.content || !this.blog.type) {
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

    this.blogService.updateBlog(this.blogId, formData).subscribe({
      next: (res) => {
        console.log('Blog updated successfully:', res);
        this.router.navigate(['/admin-blog']);
      },
      error: (err) => {
        console.log('Error updating blog:', err);
        alert('Failed to update blog');
      }
    });
  }
}
