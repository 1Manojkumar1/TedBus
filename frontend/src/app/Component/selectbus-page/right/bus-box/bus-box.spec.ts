
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusBoxComponent } from './bus-box';

describe('BusBoxComponent', () => {
  let component: BusBoxComponent;
  let fixture: ComponentFixture<BusBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BusBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

