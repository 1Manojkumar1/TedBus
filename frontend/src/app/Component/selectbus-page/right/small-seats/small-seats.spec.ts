
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallSeatsComponent } from './small-seats';

describe('SmallSeatsComponent', () => {
  let component: SmallSeatsComponent;
  let fixture: ComponentFixture<SmallSeatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmallSeatsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    
    fixture = TestBed.createComponent(SmallSeatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

