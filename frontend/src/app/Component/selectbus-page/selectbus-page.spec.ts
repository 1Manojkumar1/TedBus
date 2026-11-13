import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectbusPage } from './selectbus-page';

describe('SelectbusPage', () => {
  let component: SelectbusPage;
  let fixture: ComponentFixture<SelectbusPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectbusPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectbusPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
