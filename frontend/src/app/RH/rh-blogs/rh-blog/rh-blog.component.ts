import { Component } from '@angular/core';
import { Blog } from '../../../Model/blog.model';
import { Router, RouterLink } from '@angular/router';
import { BlogService } from '../../../Services/blog/blog.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RHNavbarComponent } from '../../rh-navbar/rh-navbar.component';

@Component({
  selector: 'app-rh-blog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, RHNavbarComponent],
  templateUrl: './rh-blog.component.html',
  styleUrl: './rh-blog.component.css'
})
export class RhBlogComponent {
  constructor(private router:Router,private Blog_service:BlogService){}
  Bloglist: Blog[] = [];
  bloglist: Blog[] = [];
  searchtext:string ="";
  heroBlog: Blog | null = null;
  loading: boolean = true;
  selectedType: string = 'all';
  types: string[] = [];

  ngOnInit(): void {
    this.loadHero(); 
    this.search()
  }
  loadHero() {
    this.Blog_service.getPubAllBlogs().subscribe({
      next: (res) => {
        this.heroBlog = res[res.length - 1]; // always the latest
        this.types = Array.from(new Set(res.map(b => b.type).filter(Boolean)));
      },
      error: (err) => console.log("ERROR", err)
    });
  }
    
  search(){
      const typeParam = this.selectedType && this.selectedType !== 'all' ? this.selectedType : undefined;
      this.Blog_service.getsearchedpubBlogs(this.searchtext, typeParam).subscribe({
        next:(res) =>{
          this.bloglist = res.content;
          this.loading = false;
        },
        error:(err) =>{
          console.log("ERROR search");
          this.loading = false;
        }
      })
  }
}
