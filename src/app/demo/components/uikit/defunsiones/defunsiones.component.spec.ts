import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefunsionesComponent } from './defunsiones.component';

describe('DefunsionesComponent', () => {
  let component: DefunsionesComponent;
  let fixture: ComponentFixture<DefunsionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefunsionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefunsionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
