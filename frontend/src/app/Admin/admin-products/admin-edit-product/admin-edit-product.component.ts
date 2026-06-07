import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../../Services/Products/products.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../Model/Category.model';
import { CategoryService } from '../../../Services/Categorys/category.service';
import { Product } from '../../../Model/Product.model';
import { AdminSidebarComponent } from "../../admin-sidebar/admin-sidebar.component";

@Component({
  selector: 'app-admin-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminSidebarComponent],
  templateUrl: './admin-edit-product.component.html',
  styleUrl: './admin-edit-product.component.css'
})
export class AdminEditProductComponent {
  constructor(private product_service:ProductsService,private category_service:CategoryService,private route:ActivatedRoute,private router:Router){}
  selectedCategoryId: number | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  product: Product = {
    id:0,
    name:"",
    description:"",
    state:"",
    price:0,
    discount:0,
    createdAt:"",
    rate:0,
    quantity:0,
    category:null,
  };
  categoryList: Category[] = [];
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.getproduct(id);
      }
    });
    
    this.category_service.getAllCategorys().subscribe({
      next: (res) => {
        this.categoryList = res;
      },
      error: (err) => {
        console.log("Error loading categories:", err);
      }
    });
  }

  getproduct(id: number) {
      this.product_service.getProductById(id).subscribe({
        next: (res) => {
          this.product = res;
          this.selectedCategoryId = res.category?.id || null;
          
          // Load existing image if present
          if (res.imageUrl) {
            this.imagePreview = res.imageUrl;
          }
          
          console.log('Loaded product:', this.product);
          console.log('Selected category ID:', this.selectedCategoryId);
        },
        error: (err) => {
          console.log(err);
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

  edit() {
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
    
    console.log('Updating product:', formData);
    
    this.product_service.updateProduct(this.product.id, formData).subscribe({
      next: (res) => {
        console.log('Success:', res);
        this.router.navigate(["/admin-products"]);
      },
      error: (err) => {
        console.log(err);
        alert('ERROR');
      }
    });
  }
}

