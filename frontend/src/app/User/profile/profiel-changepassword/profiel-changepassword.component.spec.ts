import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfielChangepasswordComponent } from './profiel-changepassword.component';

describe('ProfielChangepasswordComponent', () => {
  let component: ProfielChangepasswordComponent;
  let fixture: ComponentFixture<ProfielChangepasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfielChangepasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfielChangepasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
