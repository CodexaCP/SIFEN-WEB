import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsItemComponent } from './details-item.component';

describe('CreateItemComponent', () => {
  let component: DetailsItemComponent;
  let fixture: ComponentFixture<DetailsItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
