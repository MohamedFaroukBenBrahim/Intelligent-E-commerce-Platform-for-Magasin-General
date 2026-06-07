import { Component } from '@angular/core';
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { CategoryService } from '../../../Services/Categorys/category.service';
import { Category } from '../../../Model/Category.model';
import { CommonModule } from '@angular/common';
import { Product } from '../../../Model/Product.model';
import { ProductsService } from '../../../Services/Products/products.service';
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../../footer/footer.component";


@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [NavBarComponent, CommonModule, RouterLink, FormsModule, FooterComponent],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css'
})
export class ListProductsComponent {
  constructor(private category_service: CategoryService, private product_service: ProductsService) {}

  categorylist: Category[] = [];
  productlist: Product[] = [];

  // Filter state
  searchtext: string = '';
  selectedCategoryId: number | null = null;
  minPrice: number = 0;
  maxPrice: number = 3000;
  selectedState: string = '';
  sortBy: string = '';
  selectedStock: string = 'all';

  // Pagination
  currentPage: number = 0;
  totalPages: number = 0;
  pageSize: number = 12;

  ngOnInit(): void {
    this.category_service.getAllCategorys().subscribe({
      next: (res) => { this.categorylist = res; },
      error: (err) => { console.log('ERROR', err); }
    });
    this.search();
  }

  search(): void {
    const params: any = {
      keyword: this.searchtext || '',
      page: this.currentPage,
      size: this.pageSize
    };
    if (this.selectedCategoryId) params.categoryId = this.selectedCategoryId;
    if (this.minPrice > 0) params.minPrice = this.minPrice;
    if (this.maxPrice < 3000) params.maxPrice = this.maxPrice;
    if (this.selectedState) params.state = this.selectedState;
    params.stockStatus = this.selectedStock || 'all';
    if (this.sortBy === 'price_asc') {
      params.sortBy = 'price';
      params.direction = 'asc';
    }
    if (this.sortBy === 'price_desc') {
      params.sortBy = 'price';
      params.direction = 'desc';
    }
    if (this.sortBy === 'newest') {
      params.sortBy = 'id';
      params.direction = 'desc';
    }

    this.product_service.getsearchedProdcuts(params).subscribe({
      next: (res) => {
        this.productlist = res.content;
        this.totalPages = res.totalPages;
      },
      error: (err) => { console.log('ERROR', err); }
    });
  }

  onCategoryChange(id: number): void {
    this.selectedCategoryId = this.selectedCategoryId === id ? null : id;
    this.currentPage = 0;
    this.search();
  }

  clearFilters(): void {
    this.searchtext = '';
    this.selectedCategoryId = null;
    this.minPrice = 0;
    this.maxPrice = 3000;
    this.selectedState = '';
    this.sortBy = '';
    this.currentPage = 0;
    this.selectedStock = 'all';
    this.search();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.search();
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}

    
      
  
