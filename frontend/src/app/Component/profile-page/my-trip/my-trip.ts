import { Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Booking } from '../../../model/booking.model';

@Component({
  selector: 'app-my-trip',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './my-trip.html',
  styleUrl: './my-trip.css',
})
export class MyTrip {
  booking = input.required<Booking>();
  cancel = output<string>();

  readonly passengers = computed(() => this.booking().passengerDetails ?? []);

  readonly seats = computed(() => {
    const seats: unknown = this.booking().seats;
    if (Array.isArray(seats)) {
      return seats.map((seat) => String(seat));
    }
    if (typeof seats === 'string') {
      return seats.split(',').map((seat) => seat.trim());
    }
    return [];
  });

  readonly departuretime = computed(() =>
    this.formatTime(this.booking().departureDetails?.time)
  );

  readonly arrivaltime = computed(() =>
    this.formatTime(this.booking().arrivalDetails?.time)
  );

  isupcoming(): boolean {
    return this.booking().status === 'upcoming';
  }

  formatdate(value: string | undefined): string {
    if (!value) {
      return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  private formatTime(value: number | string | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'string' && value.includes(':')) {
      return value;
    }

    const hours = Number(value);
    if (Number.isNaN(hours)) {
      return String(value);
    }

    const wholehours = Math.floor(hours) % 24;
    const minutes = Math.round((hours - Math.floor(hours)) * 60);
    return `${String(wholehours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
}
