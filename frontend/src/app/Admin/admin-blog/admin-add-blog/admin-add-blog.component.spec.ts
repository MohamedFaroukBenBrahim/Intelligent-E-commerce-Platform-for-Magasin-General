import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddBlogComponent } from './admin-add-blog.component';

describe('AdminAddBlogComponent', () => {
  let component: AdminAddBlogComponent;
  let fixture: ComponentFixture<AdminAddBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAddBlogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAddBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
