import { Component } from '@angular/core';
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { FooterComponent } from "../../footer/footer.component";
import { BlogService } from '../../../Services/blog/blog.service';
import { Router, RouterLink } from '@angular/router';
import { Blog } from '../../../Model/blog.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listblog',
  standalone: true,
  imports: [NavBarComponent, FooterComponent, CommonModule, RouterLink,FormsModule],
  templateUrl: './listblog.component.html',
  styleUrl: './listblog.component.css'
})
export class ListblogComponent {
  constructor(private router:Router,private Blog_service:BlogService){}
  Bloglist: Blog[] = [];
  searchtext:string ="";
  heroBlog: Blog | null = null;
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
        // populate available types for filtering
        this.types = Array.from(new Set(res.map(b => b.type).filter(Boolean)));
      },
      error: (err) => console.log("ERROR", err)
    });
  }
    
  search(){
      const typeParam = this.selectedType && this.selectedType !== 'all' ? this.selectedType : undefined;
      this.Blog_service.getsearchedpubBlogs(this.searchtext, typeParam).subscribe({
        next:(res) =>{
          this.Bloglist = res.content
        },
        error:(err) =>{
          console.log("ERROR search")
        }
      })
  }

}
