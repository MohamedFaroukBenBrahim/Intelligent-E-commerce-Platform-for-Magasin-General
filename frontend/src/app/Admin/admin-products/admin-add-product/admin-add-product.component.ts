import { Component } from '@angular/core';
import { AdminSidebarComponent } from "../../admin-sidebar/admin-sidebar.component";
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../../Services/Products/products.service';
import { AddProduct } from '../../../Model/AddProduct.model';
import { Category } from '../../../Model/Category.model';
import { CategoryService } from '../../../Services/Categorys/category.service';

@Component({
  selector: 'app-admin-add-product',
  standalone: true,
  imports: [AdminSidebarComponent,RouterLink,CommonModule,FormsModule],
  templateUrl: './admin-add-product.component.html',
  styleUrl: './admin-add-product.component.css'
})
export class AdminAddProductComponent {
  constructor(private product_service:ProductsService,private category_service:CategoryService,private router:Router){}
  selectedCategoryId: number | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  product: AddProduct = {
    name:"",
    description:"",
    state:"",
    price:0,
    discount:0,
    quantity:0,
    category:null,
  };
  categoryList: Category[] = [];

  ngOnInit(): void {
    this.category_service.getAllCategorys().subscribe({
      next: (res) => {
        this.categoryList = res;
        console.log("Categories list:", res);
      },
      error: (err) => {
        console.log("Error loading categories:", err);
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  add() {
    if (!this.product.name || !this.product.description || !this.product.state || 
        !this.product.price || !this.product.quantity || !this.selectedCategoryId) {
      alert('Please fill all required fields');
      return;
    }
    
    if (this.product.discount < 0 || this.product.discount > 100) {
      alert('Discount must be between 0% and 100%');
      return;
    }

    const selectedCategory = this.categoryList.find(cat => cat.id === this.selectedCategoryId);
    console.log('Selected Category ID:', this.selectedCategoryId);
    console.log('Category List:', this.categoryList);
    console.log('Found Category:', selectedCategory);
    
    if (!selectedCategory) {
      alert('Invalid category selected');
      return;
    }

    // Create FormData for multipart request
    const formData = new FormData();
    formData.append('name', this.product.name);
    formData.append('description', this.product.description);
    formData.append('state', this.product.state);
    formData.append('price', this.product.price.toString());
    formData.append('discount', this.product.discount.toString());
    formData.append('quantity', this.product.quantity.toString());
    formData.append('categoryId', this.selectedCategoryId.toString());
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    
    console.log('Sending product with image');
    
    this.product_service.addProduct(formData).subscribe({
      next: (res) => {
        console.log('Product added successfully:', res);
        this.router.navigate(["/admin-products"]);
      },
      error: (err) => {
        console.log("Error:", err);
        alert('Failed to add product');
      }
    });
  }
}
