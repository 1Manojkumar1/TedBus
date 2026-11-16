import { Component, computed, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Booking } from '../../../model/booking.model';
import { JourneyReview } from '../../../service/review.service';

@Component({
  selector: 'app-my-trip',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './my-trip.html',
  styleUrl: './my-trip.css',
})
export class MyTrip {
  booking = input.required<Booking>();
  existingReview = input<JourneyReview | undefined>(undefined);
  cancel = output<string>();
  writeReview = output<Booking>();

  readonly isExpanded = signal(false);

  toggleDetails(): void {
    this.isExpanded.update((v) => !v);
  }

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

  isCancelled(): boolean {
    return this.booking().status === 'cancelled';
  }

  isCompleted(): boolean {
    if (this.booking().status === 'cancelled') return false;
    if (this.booking().status === 'completed') return true;
    const travelDate = this.booking().departureDetails?.date || this.booking().bookingDate;
    if (!travelDate) return false;
    const parsed = new Date(travelDate);
    if (Number.isNaN(parsed.getTime())) return false;
    parsed.setHours(23, 59, 59, 999);
    return parsed.getTime() <= Date.now();
  }

  canEditReview(): boolean {
    const rev = this.existingReview();
    if (!rev) return false;
    const createdTime = new Date(rev.createdAt).getTime();
    const hoursSince = (Date.now() - createdTime) / (1000 * 60 * 60);
    return hoursSince <= 24;
  }

  getReviewEditHoursLeft(): number {
    const rev = this.existingReview();
    if (!rev) return 0;
    const createdTime = new Date(rev.createdAt).getTime();
    const hoursSince = (Date.now() - createdTime) / (1000 * 60 * 60);
    return Math.max(0, Math.floor(24 - hoursSince));
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
