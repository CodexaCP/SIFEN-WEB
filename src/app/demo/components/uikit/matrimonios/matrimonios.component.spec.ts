import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrimoniosComponent } from './matrimonios.component';

describe('MatrimoniosComponent', () => {
  let component: MatrimoniosComponent;
  let fixture: ComponentFixture<MatrimoniosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatrimoniosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatrimoniosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
