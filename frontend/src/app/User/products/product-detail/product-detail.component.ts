import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { FooterComponent } from "../../footer/footer.component";
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../../Services/Products/products.service';
import { Product } from '../../../Model/Product.model';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../Services/Cart/cart.service';
import { CartItem } from '../../../Model/CartItem.model';
import { FormsModule } from "@angular/forms";
import { review } from '../../../Model/review.model';
import { ReviewsService } from '../../../Services/reviews/reviews.service';
import { AuthService } from '../../../Services/Auth/auth.service';
import { UserService } from '../../../Services/User/user.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [NavBarComponent, FooterComponent, CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  constructor(private product_service: ProductsService,private cart_service:CartService, private route: ActivatedRoute,private review_service:ReviewsService,private authService:AuthService,private router:Router,private user_service:UserService) {}
  recommandation:any[] = []
  showSuccessAlert = false;
  showErrorAlert = false;
  imagePreview: string | null = null;
  quantity: number = 1;
  showCraeteReviewSection = false;
  hoveredStar = 0;
  hasReviewed: boolean = false;
  userID:number = 0; 

  recomanded : Product[] = [];

  product: Product = {
    id: 0,
    name: "",
    description: "",
    state: "",
    price: 0,
    discount: 0,
    createdAt: "",
    rate: 0,
    quantity: 0,
    category: null,
  };
  newReview:review = {
    rating: 0,
    comment: '',
    productId:this.product.id
  }
  reviewlist: review[] =[]
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) this.getProduct(id);
    });
    this.getUserid();
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

  getProduct(id: number) {
    this.product_service.getProductById(id).subscribe({
      next: (res) => {
        this.product = res;
        this.newReview.productId = this.product.id;
        if (res.imageUrl) {
          this.imagePreview = res.imageUrl;
        }
        this.loadReviews(res.id);
      },
      error: (err) => console.log(err)
    });
  }
  addToCart() {
    this.cart_service.addCart(this.product.id, this.quantity).subscribe({
      next: (res) => {
        this.showSuccessAlert =true;
        setTimeout(() => this.showSuccessAlert = false, 5000);
        console.log('Item added to cart', res)},
      error: (err) => {
        this.showErrorAlert  =true;
        setTimeout(() => this.showErrorAlert  = false, 5000);
        console.error('Failed to add item', err)}
    });
  }
  loadReviews(productId: number) {
    this.review_service.getProductReview(productId).subscribe({
      next: (res) => {
        this.reviewlist = res.reverse();
        const currentUsername = this.authService.getUsername();
        this.hasReviewed = this.reviewlist.some(r => r.username === currentUsername);
      },
      error: (err) => console.log(err)
    });
  }
  submitReview(){
    this.review_service.createreview(this.newReview).subscribe({
      next: (res)=>{
        this.showCraeteReviewSection = false;
        this.loadReviews(this.product.id);
        console.log(res);
      },
      error: (err)=>{
        console.log(err);
        this.router.navigate(['/login'])
      }
    })
  } 

  getStars(rating: number): number[] {
    const count = Math.min(5, Math.max(0, Math.round(rating))); 
    return Array(count).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    const count = Math.min(5, Math.max(0, 5 - Math.round(rating)));
    return Array(count).fill(0);
  }

  get averageRating(): number {
    if (!this.reviewlist.length) return 0;
    const sum = this.reviewlist.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / this.reviewlist.length) * 10) / 10;
  }

  get ratingCounts(): { [key: number]: number } {
    const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.reviewlist.forEach(r => counts[r.rating]++);
    return counts;
  }

  getRatingPercent(star: number): number {
    if (!this.reviewlist.length) return 0;
    return (this.ratingCounts[star] / this.reviewlist.length) * 100;
  }
}