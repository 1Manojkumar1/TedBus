
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSeatsComponent } from './view-seats';

describe('ViewSeatsComponent', () => {
  let component: ViewSeatsComponent;
  let fixture: ComponentFixture<ViewSeatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSeatsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    
    fixture = TestBed.createComponent(ViewSeatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

