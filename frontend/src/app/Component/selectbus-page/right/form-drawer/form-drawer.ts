import { Component, Input, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusBookingFormComponent } from '../bus-booking-form/bus-booking-form';

@Component({
  selector: 'app-form-drawer',
  standalone: true,
  imports: [CommonModule, BusBookingFormComponent],
  templateUrl: './form-drawer.html',
  styleUrl: './form-drawer.css',
})
export class FormDrawerComponent implements OnDestroy {
  @Input() selectedseat: number[] = [];
  @Input() seatprice: number = 0;
  @Input() routedetails: any;
  @Input() busid: string = '';
  @Input() busarrivaltime: number = 0;
  @Input() busdeparturetime: number = 0;
  @Input() operatorname: string = '';

  readonly isdraweropen = signal(false);

  opendrawer(): void {
    if (this.selectedseat.length > 0) {
      this.isdraweropen.set(true);
      document.body.style.overflow = 'hidden';
    }
  }

  closedrawer(): void {
    this.isdraweropen.set(false);
    document.body.style.overflow = '';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
