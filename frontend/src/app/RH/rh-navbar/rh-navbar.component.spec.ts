import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RHNavbarComponent } from './rh-navbar.component';

describe('RHNavbarComponent', () => {
  let component: RHNavbarComponent;
  let fixture: ComponentFixture<RHNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RHNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RHNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
