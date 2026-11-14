import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { SmallSeatsComponent } from '../small-seats/small-seats';
import { FormDrawerComponent } from '../form-drawer/form-drawer';
import { TranslatePipe } from '../../../../service/translate.pipe';

export interface TravelPoint {
  name: string;
  time: string;
}

@Component({
  selector: 'app-view-seats',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDividerModule, SmallSeatsComponent, FormDrawerComponent, TranslatePipe],
  templateUrl: './view-seats.html',
  styleUrl: './view-seats.css'
})
export class ViewSeatsComponent implements OnInit, OnChanges {
  @Input() filledseats: number[] = [];
  @Input() seatprice: number = 0;
  @Input() routedetails: any;
  @Input() busid: string = '';
  @Input() busarrivaltime: number = 0;
  @Input() busdeparturetime: number = 0;
  @Input() operatorname: string = '';
  @Input() totalseats: number = 40;

  selectedseats: number[] = [];
  seatlimit = false;
  readonly maxseats = 6;

  // Boarding & Dropping selection state
  selectedBoardingPoint: string = '';
  selectedDroppingPoint: string = '';
  isEditingPoints: boolean = false;

  ngOnInit(): void {
    this.initDefaultPoints();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['routedetails'] || changes['busdeparturetime'] || changes['busarrivaltime']) {
      this.initDefaultPoints();
    }
  }

  private initDefaultPoints(): void {
    const bps = this.boardingPoints;
    if (!this.selectedBoardingPoint && bps.length > 0) {
      this.selectedBoardingPoint = bps[0].name;
    }
    const dps = this.droppingPoints;
    if (!this.selectedDroppingPoint && dps.length > 0) {
      this.selectedDroppingPoint = dps[0].name;
    }
  }

  get boardingPoints(): TravelPoint[] {
    const subs = this.routedetails?.departureLocation?.subLocations;
    const baseTime = Number(this.busdeparturetime) || 20;
    const defaultPoints = [
      `${this.routedetails?.departureLocation?.name || 'City'} Central Bus Station`,
      'Highway Toll Plaza Junction',
      'Metro Station Gate 2',
      'Ring Road Pickup Stand'
    ];
    const points = Array.isArray(subs) && subs.length ? subs : defaultPoints;
    return points.map((name: string, idx: number) => {
      const timeOffset = (baseTime + idx * 0.25) % 24;
      return {
        name,
        time: this.handletime(timeOffset)
      };
    });
  }

  get droppingPoints(): TravelPoint[] {
    const subs = this.routedetails?.arrivalLocation?.subLocations;
    const baseTime = Number(this.busarrivaltime) || 6;
    const defaultPoints = [
      `${this.routedetails?.arrivalLocation?.name || 'City'} Central Drop Terminal`,
      'Airport Bypass Circle',
      'Electronic City Flyover End',
      'Interstate Bus Terminal Bay 4'
    ];
    const points = Array.isArray(subs) && subs.length ? subs : defaultPoints;
    return points.map((name: string, idx: number) => {
      const timeOffset = (baseTime + idx * 0.25) % 24;
      return {
        name,
        time: this.handletime(timeOffset)
      };
    });
  }

  get currentBoarding(): TravelPoint {
    const found = this.boardingPoints.find(p => p.name === this.selectedBoardingPoint);
    return found || this.boardingPoints[0] || {
      name: this.routedetails?.departureLocation?.name || 'Departure',
      time: this.handletime(this.busdeparturetime)
    };
  }

  get currentDropping(): TravelPoint {
    const found = this.droppingPoints.find(p => p.name === this.selectedDroppingPoint);
    return found || this.droppingPoints[0] || {
      name: this.routedetails?.arrivalLocation?.name || 'Arrival',
      time: this.handletime(this.busarrivaltime)
    };
  }

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

  togglePointEditor(): void {
    this.isEditingPoints = !this.isEditingPoints;
  }

  selectBoarding(name: string): void {
    this.selectedBoardingPoint = name;
  }

  selectDropping(name: string): void {
    this.selectedDroppingPoint = name;
  }
}
