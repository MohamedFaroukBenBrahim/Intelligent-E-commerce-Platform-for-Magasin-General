import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RHHomeComponent } from './rh-home.component';

describe('RHHomeComponent', () => {
  let component: RHHomeComponent;
  let fixture: ComponentFixture<RHHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RHHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RHHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
