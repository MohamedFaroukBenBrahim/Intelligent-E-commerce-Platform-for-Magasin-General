import { Component, OnInit } from '@angular/core';
import { Blog } from '../../../Model/blog.model';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../../Services/blog/blog.service';
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { FooterComponent } from "../../footer/footer.component";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-blogdetail',
  standalone: true,
  imports: [NavBarComponent, FooterComponent, CommonModule, RouterLink],
  templateUrl: './blogdetail.component.html',
  styleUrl: './blogdetail.component.css'
})
export class BlogdetailComponent implements OnInit {
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