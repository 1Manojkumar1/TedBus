import { Component, Input } from '@angular/core';
import {
  averageRating,
  busTypeLabel,
  clockFormat,
  fareForBus,
  toHours,
} from '../../../../model/bus.util';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BottomTabComponent } from '../bus-book/bottom-tab/bottom-tab';

@Component({
  selector: 'app-bus-box',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, BottomTabComponent],
  templateUrl: './bus-box.html',
  styleUrl: './bus-box.css'
})
export class BusBoxComponent {
  @Input() rating: number[] = [];
  @Input() operatorname: string = '';
  @Input() bustype: string = '';
  @Input() departuretime: string = '';
  @Input() reschedulable: number = 0;
  @Input() livetracking: number = 0;
  @Input() filledseats: number[] = [];
  @Input() routedetails: any;
  @Input() busid: string = '';
  @Input() totalseats: number = 40;

  get durationhours(): number {
    return Number(this.routedetails?.duration) || 0;
  }

  get bustypename(): string {
    return busTypeLabel(this.bustype);
  }

  get seatprice(): number {
    return fareForBus(this.bustype, this.durationhours);
  }

  get avgrating(): number {
    return averageRating(this.rating);
  }

  get reviews(): number {
    return this.rating.length;
  }

  get departurehours(): number {
    return toHours(this.departuretime);
  }

  get arrivalhours(): number {
    return (this.departurehours + this.durationhours) % 24;
  }

  get departurelabel(): string {
    return clockFormat(this.departurehours);
  }

  get arrivallabel(): string {
    return clockFormat(this.arrivalhours);
  }

  get seatsavailable(): number {
    return Math.max(0, this.totalseats - this.filledseats.length);
  }


}
