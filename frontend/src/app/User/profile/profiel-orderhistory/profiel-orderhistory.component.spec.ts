import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfielOrderhistoryComponent } from './profiel-orderhistory.component';

describe('ProfielOrderhistoryComponent', () => {
  let component: ProfielOrderhistoryComponent;
  let fixture: ComponentFixture<ProfielOrderhistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfielOrderhistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfielOrderhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
