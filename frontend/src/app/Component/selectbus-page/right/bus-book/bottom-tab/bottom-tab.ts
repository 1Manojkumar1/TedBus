import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewSeatsComponent } from '../../view-seats/view-seats';
import { TranslatePipe } from '../../../../../service/translate.pipe';

@Component({
  selector: 'app-bottom-tab',
  standalone: true,
  imports: [CommonModule, ViewSeatsComponent, TranslatePipe],
  templateUrl: './bottom-tab.html',
  styleUrl: './bottom-tab.css',
})
export class BottomTabComponent {
  @Input() filledseats: number[] = [];
  @Input() seatprice: number = 0;
  @Input() routedetails: any;
  @Input() busarrivaltime: number = 0;
  @Input() busdeparturetime: number = 0;
  @Input() operatorname: string = '';
  @Input() busid: string = '';
  @Input() totalseats: number = 40;

  tabstate: boolean[] = [false, false, false, false, false];

  handletabstate(value: number): void {
    for (let i = 0; i < this.tabstate.length; i++) {
      this.tabstate[i] = i === value && !this.tabstate[i];
    }
  }

  get boardingPoints(): { name: string; time: string }[] {
    const subs = this.routedetails?.departureLocation?.subLocations;
    const baseTime = Number(this.busdeparturetime) || 20;
    const defaultPoints = [
      `${this.routedetails?.departureLocation?.name || 'City'} Central Bus Terminal`,
      'Highway Junction Toll Plaza',
      'Main Ring Road Pickup Point',
      'City Metro Station Gateway',
    ];
    const points = Array.isArray(subs) && subs.length ? subs : defaultPoints;
    return points.map((name: string, idx: number) => {
      const timeOffset = (baseTime + idx * 0.25) % 24;
      const h = Math.floor(timeOffset);
      const m = Math.round((timeOffset - h) * 60);
      return {
        name,
        time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      };
    });
  }

  get droppingPoints(): { name: string; time: string }[] {
    const subs = this.routedetails?.arrivalLocation?.subLocations;
    const baseTime = Number(this.busarrivaltime) || 6;
    const defaultPoints = [
      `${this.routedetails?.arrivalLocation?.name || 'City'} Central Drop Point`,
      'Airport Bypass Circle',
      'Tech Corridor Junction',
      'Interstate Bus Terminal Platform',
    ];
    const points = Array.isArray(subs) && subs.length ? subs : defaultPoints;
    return points.map((name: string, idx: number) => {
      const timeOffset = (baseTime + idx * 0.25) % 24;
      const h = Math.floor(timeOffset);
      const m = Math.round((timeOffset - h) * 60);
      return {
        name,
        time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      };
    });
  }
}
