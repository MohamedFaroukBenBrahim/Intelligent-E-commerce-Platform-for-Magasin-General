import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RHSpaceComponent } from './rh-space.component';

describe('RHSpaceComponent', () => {
  let component: RHSpaceComponent;
  let fixture: ComponentFixture<RHSpaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RHSpaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RHSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
