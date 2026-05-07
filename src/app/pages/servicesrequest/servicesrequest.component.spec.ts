import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesrequestComponent } from './servicesrequest.component';

describe('ServicesrequestComponent', () => {
  let component: ServicesrequestComponent;
  let fixture: ComponentFixture<ServicesrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicesrequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
