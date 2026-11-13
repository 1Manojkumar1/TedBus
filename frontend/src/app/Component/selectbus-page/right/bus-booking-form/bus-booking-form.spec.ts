
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusBookingFormComponent } from './bus-booking-form';

describe('BusBookingFormComponent', () => {
  let component: BusBookingFormComponent;
  let fixture: ComponentFixture<BusBookingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusBookingFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    
    fixture = TestBed.createComponent(BusBookingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

