import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentPage } from './payment-page';

describe('PaymentPage', () => {
  let component: PaymentPage;
  let fixture: ComponentFixture<PaymentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
