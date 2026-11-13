
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomTabComponent } from './bottom-tab';

describe('BottomTabComponent', () => {
  let component: BottomTabComponent;
  let fixture: ComponentFixture<BottomTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomTabComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    
    fixture = TestBed.createComponent(BottomTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

