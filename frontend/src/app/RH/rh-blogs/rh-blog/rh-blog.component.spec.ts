import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RhBlogComponent } from './rh-blog.component';

describe('RhBlogComponent', () => {
  let component: RhBlogComponent;
  let fixture: ComponentFixture<RhBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RhBlogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RhBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
