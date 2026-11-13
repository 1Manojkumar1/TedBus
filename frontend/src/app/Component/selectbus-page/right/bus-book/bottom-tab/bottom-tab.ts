import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewSeatsComponent } from '../../view-seats/view-seats';

@Component({
  selector: 'app-bottom-tab',
  standalone: true,
  imports: [CommonModule, ViewSeatsComponent],
  templateUrl: './bottom-tab.html',
  styleUrl: './bottom-tab.css'
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
}
