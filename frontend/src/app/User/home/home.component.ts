import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { AuthService } from '../../Services/Auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { FooterComponent } from "../footer/footer.component";
import { BlogService } from '../../Services/blog/blog.service';
import { Blog } from '../../Model/blog.model';
import { RecrutementService } from '../../Services/recrutement/recrutement.service';
import { ProductsService } from '../../Services/Products/products.service';
import { Product } from '../../Model/Product.model';
import { UserService } from '../../Services/User/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavBarComponent, FooterComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  openPositions: number = 0;
  peopleApplied: number = 0;
  statsLoading = true;

  constructor(private authService:AuthService,private router:Router,private Blog_service:BlogService,private recrutementService:RecrutementService,private product_service:ProductsService,private user_service:UserService){}
  recommandation:any[] = []
  topDiscountProducts: Product[] = [];
  latestProducts: Product[] = [];
  Bloglist: Blog[] = []; 
  featuredBlog: Blog | null = null;
  sideBlogs: Blog[] = [];
  userID:number = 0; 
  ngOnInit(): void {
    this.getUserid();
    this.loadBlogs();
    this.loadTopDiscountProducts();
    this.loadLatestProducts();
    this.loadStats();
  }

  loadBlogs() {
    this.Blog_service.getPubAllBlogs().subscribe({
      next: (res) => { 
        this.Bloglist = res ?? [];
        this.featuredBlog = this.Bloglist.length > 0 ? this.Bloglist[this.Bloglist.length - 1] : null;
        this.sideBlogs = this.Bloglist.slice(0, -1).slice(-4).reverse();
      },
      error: (err) => { 
        console.log("ERROR", err)
      }
    });
  }

  loadStats() {
    this.recrutementService.getActiveOffers().subscribe({
      next: (res) => {
        this.openPositions = res.totalElements;
        this.statsLoading = false;      
      },
      error: (err) => { 
        this.statsLoading = false;
        console.log(err)
      }
    });
    this.recrutementService.getActiveOffers().subscribe({
      next: (res) => {
        let n = 0;
        for (let i = 0; i < res.content.length; i++) {
          n += res.content[i].applicationCount; 
        }
        this.peopleApplied = n;
      },
      error: (err) => {
        console.log('ERROR', err);
      }
    });
  }

  getRecommandationpy(){
    this.product_service.getRecommandationPy(this.userID).subscribe({
      next: (res)=>{
        this.recommandation = res.reverse()
        console.log(res)
      },
      error: (err)=>{
        console.log(err)
      }
    })
  }

  loadTopDiscountProducts() {
    this.product_service.getAllProducts().subscribe({
      next: (res) => {
        const products = this.normalizeProducts(res);
        this.topDiscountProducts = products
          .filter((product: Product) => (product.discount ?? 0) > 0)
          .sort((a: Product, b: Product) => b.discount - a.discount)
          .slice(0, 10);
      },
      error: (err) => {
        console.log('ERROR discounts', err);
      }
    });
  }

  loadLatestProducts() {
    this.product_service.getAllProducts().subscribe({
      next: (res) => {
        const products = this.normalizeProducts(res);
        this.latestProducts = products
          .sort((a: Product, b: Product) => {
            const dateA = new Date(a.createdAt ?? '').getTime() || a.id;
            const dateB = new Date(b.createdAt ?? '').getTime() || b.id;
            return dateB - dateA;
          })
          .slice(0, 10);
      },
      error: (err) => {
        console.log('ERROR latest', err);
      }
    });
  }

  private normalizeProducts(response: any): Product[] {
    const products = Array.isArray(response) ? response : (response?.content ?? []);
    return products.map((product: any) => ({
      ...product,
      imageUrl: product.imageUrl ?? product.image_url ?? '',
      category: product.category ?? (product.category_name ? { name: product.category_name } : product.categorie_id ? { name: `Category ${product.categorie_id}` } : null),
      description: product.description ?? ''
    }));
  }

  getUserid(){
    this.user_service.getme().subscribe({
      next: (res)=>{
        this.userID = res.id;
        console.log('Resolved userID from /users/me:', this.userID);
        this.getRecommandationpy();
      },
      error: (err) => {
        console.log('Error loading /users/me:', err);
      }
    })
  }

}
