import { Component } from '@angular/core';
import { AdminSidebarComponent } from "../../admin-sidebar/admin-sidebar.component";
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../../Services/Products/products.service';
import { Product } from '../../../Model/Product.model';
import { CategoryService } from '../../../Services/Categorys/category.service';
import { Category } from '../../../Model/Category.model';
import { forkJoin } from 'rxjs';

interface CategorySummary {
  key: number | 'uncategorized';
  name: string;
  productCount: number;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [AdminSidebarComponent,RouterLink,CommonModule,FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css'
})
export class AdminProductsComponent {
  constructor(private product_service: ProductsService,private category_service: CategoryService){}
  allProducts: Product[] = [];
  searchedProducts: Product[] | null = null;
  filteredProducts: Product[] = [];
  productlist: Product[] = [];
  categorySummaries: CategorySummary[] = [];
  searchtext: string ="";
  selectedCategory: number | 'all' | 'uncategorized' = 'all';
  currentPage: number = 0;
  totalPages: number = 0;
  pageSize: number = 12;
  
  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      products: this.product_service.getAllProducts(),
      categories: this.category_service.getAllCategorys()
    }).subscribe({
      next: ({ products, categories }) => {
        this.allProducts = products || [];
        this.buildCategorySummaries(categories || []);
        this.applyFilters();
      },
      error: (err) => {
        console.log('ERROR', err);
      }
    });
  }

  buildCategorySummaries(categories: Category[]): void {
    const categoryCountMap = new Map<number, number>();
    let uncategorizedCount = 0;

    for (const product of this.allProducts) {
      const categoryId = product.category?.id;

      if (categoryId == null) {
        uncategorizedCount += 1;
        continue;
      }

      categoryCountMap.set(categoryId, (categoryCountMap.get(categoryId) || 0) + 1);
    }

    this.categorySummaries = categories
      .map((category) => ({
        key: category.id,
        name: category.name,
        productCount: categoryCountMap.get(category.id) || 0
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (uncategorizedCount > 0) {
      this.categorySummaries.push({
        key: 'uncategorized',
        name: 'Uncategorized',
        productCount: uncategorizedCount
      });
    }
  }

  delete(id :number){
    if(!confirm('this product might have an order. if not deleted')){
      return;
    }
    this.product_service.deleteProduct(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.log(err);
          alert('ERROR');
        }
    });
  }

  selectCategory(category: number | 'all' | 'uncategorized'): void {
    this.selectedCategory = category;
    this.currentPage = 0;
    this.applyFilters();
  }

  search(): void {
    this.currentPage = 0;

    const keyword = this.searchtext.trim();
    if (!keyword) {
      this.searchedProducts = null;
      this.applyFilters();
      return;
    }

    this.product_service.getsearchedProdcuts({ keyword }).subscribe({
      next: (res) => {
        // Support both paginated and non-paginated backend responses.
        this.searchedProducts = Array.isArray(res) ? res : (res?.content || []);
        this.applyFilters();
      },
      error: (err) => {
        console.log('ERROR', err);
      }
    });
  }

  applyFilters(): void {
    const sourceProducts = this.searchedProducts ?? this.allProducts;
    let result = [...sourceProducts];

    if (this.selectedCategory === 'uncategorized') {
      result = result.filter((product) => !product.category?.id);
    } else if (this.selectedCategory !== 'all') {
      result = result.filter((product) => product.category?.id === this.selectedCategory);
    }

    const keyword = this.searchtext.trim().toLowerCase();
    if (keyword) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.description?.toLowerCase().includes(keyword) ||
        product.category?.name?.toLowerCase().includes(keyword)
      );
    }

    this.filteredProducts = result;
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);

    if (this.totalPages === 0) {
      this.currentPage = 0;
      this.productlist = [];
      return;
    }

    if (this.currentPage >= this.totalPages) {
      this.currentPage = this.totalPages - 1;
    }

    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.productlist = this.filteredProducts.slice(start, end);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.applyFilters();
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  getSelectedCategoryLabel(): string {
    if (this.selectedCategory === 'all') {
      return 'All categories';
    }

    if (this.selectedCategory === 'uncategorized') {
      return 'Uncategorized';
    }

    const selected = this.categorySummaries.find((category) => category.key === this.selectedCategory);
    return selected?.name || 'Selected category';
  }
}
