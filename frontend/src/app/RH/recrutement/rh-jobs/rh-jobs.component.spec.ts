import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RHJobsComponent } from './rh-jobs.component';

describe('RHJobsComponent', () => {
  let component: RHJobsComponent;
  let fixture: ComponentFixture<RHJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RHJobsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RHJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
