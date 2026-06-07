import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RHAddjobComponent } from './rh-addjob.component';

describe('RHAddjobComponent', () => {
  let component: RHAddjobComponent;
  let fixture: ComponentFixture<RHAddjobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RHAddjobComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RHAddjobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
