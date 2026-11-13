import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Right } from './right';

describe('Right', () => {
  let component: Right;
  let fixture: ComponentFixture<Right>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Right],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(Right);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
