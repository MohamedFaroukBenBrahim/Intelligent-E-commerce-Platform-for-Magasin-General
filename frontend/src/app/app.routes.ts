import { Routes } from '@angular/router';
import { LoginComponent } from './Auth/login/login.component';
import { SignUpComponent } from './Auth/sign-up/sign-up.component';
import { HomeComponent } from './User/home/home.component';
import { PageNotFoundComponent } from './User/page-not-found/page-not-found.component';
import { Oauth2RedirectComponent } from './Auth/oauth2-redirect/oauth2-redirect.component';
import { ResetPasswordComponent } from './Auth/reset-password/reset-password.component';
import { AdminHomeComponent } from './Admin/admin-home/admin-home.component';
import { AdminCategorysComponent } from './Admin/admin-categorys/admin-categorys/admin-categorys.component';
import { AdminAddCategoryComponent } from './Admin/admin-categorys/admin-add-category/admin-add-category.component';
import { AdminEditCategoryComponent } from './Admin/admin-categorys/admin-edit-category/admin-edit-category.component';
import { AdminEditProductComponent } from './Admin/admin-products/admin-edit-product/admin-edit-product.component';
import { AdminAddProductComponent } from './Admin/admin-products/admin-add-product/admin-add-product.component';
import { AdminProductsComponent } from './Admin/admin-products/admin-products/admin-products.component';
import { adminGuard } from './guards/admin.guard';
import { AdminBlogsComponent } from './Admin/admin-blog/admin-blogs/admin-blogs.component';
import { AdminEditBlogComponent } from './Admin/admin-blog/admin-edit-blog/admin-edit-blog.component';
import { AdminAddBlogComponent } from './Admin/admin-blog/admin-add-blog/admin-add-blog.component';
import { ListProductsComponent } from './User/products/list-products/list-products.component';
import { ProductDetailComponent } from './User/products/product-detail/product-detail.component';
import { CartComponent } from './User/cart/cart.component';
import { authGuard } from './guards/auth.guard';
import { CheckoutComponent } from './User/checkout/checkout.component';
import { ListblogComponent } from './User/blog/listblog/listblog.component';
import { BlogdetailComponent } from './User/blog/blogdetail/blogdetail.component';
import { AdminOrderComponent } from './Admin/admin-orders/admin-order/admin-order.component';
import { AdminUsersComponent } from './Admin/admin-users/admin-users.component';
import { ProfilePageComponent } from './User/profile/profile-page/profile-page.component';
import { ProfielOrderhistoryComponent } from './User/profile/profiel-orderhistory/profiel-orderhistory.component';
import { ProfielChangepasswordComponent } from './User/profile/profiel-changepassword/profiel-changepassword.component';
import { ContactComponent } from './User/contact/contact.component';
import { MyMgComponent } from './User/my-mg/my-mg.component';
import { AdminRestockComponent } from './Admin/admin-products/admin-restock/admin-restock.component';
import { AdminContactComponent } from './Admin/admin-contact/admin-contact.component';
import { MyReviewsComponent } from './User/profile/my-reviews/my-reviews.component';
import { RHHomeComponent } from './RH/rh-home/rh-home.component';
import { RHJobsComponent } from './RH/recrutement/rh-jobs/rh-jobs.component';
import { RHAddjobComponent } from './RH/recrutement/rh-addjob/rh-addjob.component';
import { RHGuard } from './guards/rh.guard';
import { RhEditjobComponent } from './RH/recrutement/rh-editjob/rh-editjob.component';
import { RecrutementPageComponent } from './User/recrutement/recrutement-page/recrutement-page.component';
import { ProfileRecrutementComponent } from './User/profile/profile-recrutement/profile-recrutement.component';
import { ApplyJobComponent } from './User/recrutement/apply-job/apply-job.component';
import { RhJobApplicationsComponent } from './RH/recrutement/rh-job-applications/rh-job-applications.component';
import { AdminReviewsComponent } from './Admin/admin-userreviews/admin-reviews/admin-reviews.component';
import { AboutusComponent } from './User/aboutus/aboutus.component';
import { RhBlogComponent } from './RH/rh-blogs/rh-blog/rh-blog.component';
import { RhBlogdetailComponent } from './RH/rh-blogs/rh-blogdetail/rh-blogdetail.component';
import { RHSpaceComponent } from './RH/rh-space/rh-space.component';
import { RhApplicationsComponent } from './RH/rh-applications/rh-applications.component';

export const routes: Routes = [
    // Authentification Paths 
    { path: 'signup',component:SignUpComponent },
    { path: 'login',component:LoginComponent },
    { path: 'oauth2/redirect', component: Oauth2RedirectComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    //Admin
    { path: 'admin-home', component: AdminHomeComponent,canActivate: [adminGuard] },
    { path: 'admin-categorys', component: AdminCategorysComponent,canActivate: [adminGuard] },
    { path: 'admin-addcategory', component: AdminAddCategoryComponent,canActivate: [adminGuard] },
    { path: 'admin-editcategory/:id', component: AdminEditCategoryComponent ,canActivate:[adminGuard] },
    { path: 'admin-products', component: AdminProductsComponent,canActivate: [adminGuard] },
    { path: 'admin-editproduct/:id', component: AdminEditProductComponent,canActivate: [adminGuard]},
    { path: 'admin-addproduct', component: AdminAddProductComponent ,canActivate: [adminGuard]},
    { path: 'admin-adjust-stock/:id', component: AdminRestockComponent,canActivate: [adminGuard] },
    { path: 'admin-orders', component: AdminOrderComponent ,canActivate: [adminGuard]},    
    { path: 'admin-blog', component: AdminBlogsComponent ,canActivate: [adminGuard]},
    { path: 'admin-editblog/:id', component: AdminEditBlogComponent,canActivate: [adminGuard]},
    { path: 'admin-users', component: AdminUsersComponent,canActivate: [adminGuard]},
    { path: 'admin-contact', component: AdminContactComponent,canActivate: [adminGuard]},
    { path: 'admin-addblog', component: AdminAddBlogComponent,canActivate: [adminGuard]},
    { path: 'admin-review', component: AdminReviewsComponent,canActivate: [adminGuard]},
    //RH
    { path:'RH-home',component:RHHomeComponent,canActivate: [RHGuard]},
    { path:'RH-jobs',component:RHJobsComponent,canActivate: [RHGuard]},
    { path:'RH-addjob',component:RHAddjobComponent,canActivate: [RHGuard]},
    { path:'RH-editjob/:id',component:RhEditjobComponent,canActivate: [RHGuard]},
    { path: 'RH-space', component: RHSpaceComponent, canActivate: [RHGuard] },
    { path: 'RH-applications', component: RhApplicationsComponent, canActivate: [RHGuard] },
    { path: 'RH-applications/:id', component: RhJobApplicationsComponent,canActivate: [RHGuard] },
    { path: 'RH-blog', component: RhBlogComponent,canActivate: [RHGuard] },
    { path: 'RH-blogdetail/:id', component: RhBlogdetailComponent,canActivate: [RHGuard] },
    // user
    { path: 'mymg',component:MyMgComponent},
    { path: 'contact',component: ContactComponent},
    { path: 'listProducts', component: ListProductsComponent},
    { path: 'product-detail/:id', component: ProductDetailComponent},
    { path: 'cart', component: CartComponent,canActivate:[authGuard]},
    { path: 'checkout', component: CheckoutComponent,canActivate:[authGuard]},
    { path: 'listblog', component: ListblogComponent},
    { path: 'blogdetail/:id', component: BlogdetailComponent},
    { path: 'recrutement',component:RecrutementPageComponent},
    { path: 'apply/:id', component: ApplyJobComponent },
    { path: 'aboutus', component: AboutusComponent },
    // profile
    { path: 'profile',component: ProfilePageComponent,canActivate:[authGuard]},
    { path: 'orderHistory',component: ProfielOrderhistoryComponent,canActivate:[authGuard]},
    { path: 'myreviews',component: MyReviewsComponent,canActivate:[authGuard]},
    { path: 'changepassword',component: ProfielChangepasswordComponent,canActivate:[authGuard]},
    { path: 'profile-recrutement',component: ProfileRecrutementComponent,canActivate:[authGuard]},

    // Other for now : )
    { path: '',component:HomeComponent },
    { path: '**', component: PageNotFoundComponent },
    
    
];
