import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RhEditjobComponent } from './rh-editjob.component';

describe('RhEditjobComponent', () => {
  let component: RhEditjobComponent;
  let fixture: ComponentFixture<RhEditjobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RhEditjobComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RhEditjobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
