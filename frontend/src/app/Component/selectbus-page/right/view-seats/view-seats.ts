import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { SmallSeatsComponent } from '../small-seats/small-seats';
import { FormDrawerComponent } from '../form-drawer/form-drawer';

@Component({
  selector: 'app-view-seats',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDividerModule, SmallSeatsComponent, FormDrawerComponent],
  templateUrl: './view-seats.html',
  styleUrl: './view-seats.css'
})
export class ViewSeatsComponent {
  @Input() filledseats: number[] = [];
  @Input() seatprice: number = 0;
  @Input() routedetails: any;
  @Input() busid: string = '';
  @Input() busarrivaltime: number = 0;
  @Input() busdeparturetime: number = 0;
  @Input() operatorname: string = '';
  @Input() totalseats: number = 40;

  selectedseats: number[] = [];
  boardanddrop: boolean = false;
  seatlimit = false;

  readonly maxseats = 6;

  get seatcolumns(): number[][] {
    const total = Math.max(this.totalseats || 40, 1);
    const seats = Array.from({ length: total }, (_, index) => index + 1);
    const persquare = Math.ceil(total / 4);
    return [
      seats.slice(0, persquare),
      seats.slice(persquare, persquare * 2),
      seats.slice(persquare * 2, persquare * 3),
      seats.slice(persquare * 3),
    ];
  }

  handletime(value: number): string {
    const hours = Math.floor(value) % 24;
    const minutes = Math.round((value - Math.floor(value)) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  handleselectedseats(seatno: number): void {
    if (this.filledseats.includes(seatno)) {
      return;
    }

    if (this.selectedseats.includes(seatno)) {
      this.selectedseats = this.selectedseats.filter((item) => item !== seatno);
      this.seatlimit = false;
      return;
    }

    if (this.selectedseats.length >= this.maxseats) {
      this.seatlimit = true;
      return;
    }

    this.selectedseats.push(seatno);
    this.seatlimit = false;
  }

  handleboarddrop(): void {
    this.boardanddrop = !this.boardanddrop;
  }
}
