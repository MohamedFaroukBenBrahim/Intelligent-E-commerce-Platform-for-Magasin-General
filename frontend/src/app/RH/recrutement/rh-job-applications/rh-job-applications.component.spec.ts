import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RhJobApplicationsComponent } from './rh-job-applications.component';

describe('RhJobApplicationsComponent', () => {
  let component: RhJobApplicationsComponent;
  let fixture: ComponentFixture<RhJobApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RhJobApplicationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RhJobApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
