import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCategorysComponent } from './admin-categorys.component';

describe('AdminCategorysComponent', () => {
  let component: AdminCategorysComponent;
  let fixture: ComponentFixture<AdminCategorysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCategorysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCategorysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
