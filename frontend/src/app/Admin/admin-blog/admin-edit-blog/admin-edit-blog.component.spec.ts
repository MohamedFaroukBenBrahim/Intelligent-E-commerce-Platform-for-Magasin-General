import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditBlogComponent } from './admin-edit-blog.component';

describe('AdminEditBlogComponent', () => {
  let component: AdminEditBlogComponent;
  let fixture: ComponentFixture<AdminEditBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEditBlogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEditBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
