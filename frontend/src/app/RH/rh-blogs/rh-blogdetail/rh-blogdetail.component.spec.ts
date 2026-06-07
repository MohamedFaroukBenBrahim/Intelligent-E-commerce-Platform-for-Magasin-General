import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RhBlogdetailComponent } from './rh-blogdetail.component';

describe('RhBlogdetailComponent', () => {
  let component: RhBlogdetailComponent;
  let fixture: ComponentFixture<RhBlogdetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RhBlogdetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RhBlogdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
