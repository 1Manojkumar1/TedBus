
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-small-seats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './small-seats.html',
  styleUrl: './small-seats.css'
})
export class SmallSeatsComponent {
  @Input() seatno = 0;
  @Input() alreadybookedseats: number[] = [];
  @Input() selectedseats: number[] = [];
  @Output() seatselected = new EventEmitter<number>();

  get occupied(): boolean { return this.alreadybookedseats.includes(this.seatno); }
  get selected(): boolean { return this.selectedseats.includes(this.seatno); }
  get label(): string {
    return `Seat ${this.seatno}, ${this.occupied ? 'occupied' : this.selected ? 'selected' : 'available'}`;
  }

  handleseatbooking(): void {
    if (!this.occupied) this.seatselected.emit(this.seatno);
  }
}

