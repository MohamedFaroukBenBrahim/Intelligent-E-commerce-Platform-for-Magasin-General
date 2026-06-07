import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMgComponent } from './my-mg.component';

describe('MyMgComponent', () => {
  let component: MyMgComponent;
  let fixture: ComponentFixture<MyMgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyMgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyMgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
