import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileRecrutementComponent } from './profile-recrutement.component';

describe('ProfileRecrutementComponent', () => {
  let component: ProfileRecrutementComponent;
  let fixture: ComponentFixture<ProfileRecrutementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileRecrutementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileRecrutementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
