
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDrawerComponent } from './form-drawer';

describe('FormDrawerComponent', () => {
  let component: FormDrawerComponent;
  let fixture: ComponentFixture<FormDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormDrawerComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    
    fixture = TestBed.createComponent(FormDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

