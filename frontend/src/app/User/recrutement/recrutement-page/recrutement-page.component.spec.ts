import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecrutementPageComponent } from './recrutement-page.component';

describe('RecrutementPageComponent', () => {
  let component: RecrutementPageComponent;
  let fixture: ComponentFixture<RecrutementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecrutementPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecrutementPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
