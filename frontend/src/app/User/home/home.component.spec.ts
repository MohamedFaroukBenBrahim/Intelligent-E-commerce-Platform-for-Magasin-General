/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService } from '../../Services/Auth/auth.service';
import { BlogService } from '../../Services/blog/blog.service';
import { ProductsService } from '../../Services/Products/products.service';
import { RecrutementService } from '../../Services/recrutement/recrutement.service';
import { UserService } from '../../Services/User/user.service';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let blogServiceSpy: jasmine.SpyObj<BlogService>;
  let recrutementServiceSpy: jasmine.SpyObj<RecrutementService>;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    blogServiceSpy = jasmine.createSpyObj('BlogService', ['getPubAllBlogs']);
    recrutementServiceSpy = jasmine.createSpyObj('RecrutementService', ['getActiveOffers']);
    productsServiceSpy = jasmine.createSpyObj('ProductsService', ['getRecommandationPy', 'getAllProducts']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['getme']);

    blogServiceSpy.getPubAllBlogs.and.returnValue(of([]));
    recrutementServiceSpy.getActiveOffers.and.returnValue(of({ totalElements: 0, content: [] }));
    productsServiceSpy.getRecommandationPy.and.returnValue(of([]));
    productsServiceSpy.getAllProducts.and.returnValue(of([]));
    userServiceSpy.getme.and.returnValue(of({ id: 1 }));
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: BlogService, useValue: blogServiceSpy },
        { provide: RecrutementService, useValue: recrutementServiceSpy },
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
