import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BlogService } from '../../../Services/blog/blog.service';
import { Blog } from '../../../Model/blog.model';
import { CommonModule } from '@angular/common';
import { RHNavbarComponent } from '../../rh-navbar/rh-navbar.component';

@Component({
  selector: 'app-rh-blogdetail',
  standalone: true,
  imports: [CommonModule, RouterLink, RHNavbarComponent],
  templateUrl: './rh-blogdetail.component.html',
  styleUrl: './rh-blogdetail.component.css'
})
export class RhBlogdetailComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blog_service: BlogService
  ) {}

  blog: Blog | null = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id']; 
      this.loadBlog(id);
    });
  }

  loadBlog(id: number) {
    this.blog_service.getBlogById(id).subscribe({
      next: (res) => {
        this.blog = res;
      },
      error: (err) => {
        console.error(`Failed to load blog — HTTP ${err.status}:`, err.message, err);
        alert(`Failed to load blog (HTTP ${err.status}). See console for details.`);
        this.router.navigate(['/listblog']);
      }
    });
  }
}
