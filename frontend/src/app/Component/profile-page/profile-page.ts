import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { BusService } from '../../service/bus.service';
import { AuthService } from '../../service/auth.service';
import { Booking } from '../../model/booking.model';
import { MyTrip } from './my-trip/my-trip';

type ProfileView = 'trips' | 'profile' | 'wallet';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [MatIconModule, RouterLink, MyTrip],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  private readonly busbooking = inject(BusService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  selecteditem = signal<ProfileView>('trips');
  readonly currentcustomer = this.auth.user;
  mytrip = signal<Booking[]>([]);
  loading = signal(false);
  loaderror = signal('');
  actionmessage = signal('');
  cancelling = signal<string | null>(null);

  initials = computed(() => {
    const name = this.currentcustomer()?.name?.trim();
    if (!name) {
      return '?';
    }
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  });

  upcomingcount = computed(
    () => this.mytrip().filter((trip) => trip.status === 'upcoming').length
  );

  totalspend = computed(() =>
    this.mytrip()
      .filter((trip) => trip.status !== 'cancelled')
      .reduce((total, trip) => total + (Number(trip.fare) || 0), 0)
  );

  refundtotal = computed(() =>
    this.mytrip()
      .filter((trip) => trip.status === 'cancelled')
      .reduce((total, trip) => total + (Number(trip.refundAmount) || 0), 0)
  );

  completedcount = computed(
    () => this.mytrip().filter((trip) => trip.status === 'completed').length
  );

  handlelistitemclick(selected: ProfileView): void {
    this.selecteditem.set(selected);
  }

  ngOnInit(): void {
    if (this.currentcustomer()?._id) {
      this.loadtrips();
    }
  }

  canceltrip(bookingid: string): void {
    if (this.cancelling()) {
      return;
    }

    this.busbooking.getrefundquote(bookingid).subscribe({
      next: (quote) => {
        const confirmed = window.confirm(
          `Cancel this trip? Refund amount: ₹${quote.refundAmount}.`
        );
        if (!confirmed) {
          return;
        }

        this.cancelling.set(bookingid);
        this.actionmessage.set('');
        this.busbooking.cancelbooking(bookingid).subscribe({
          next: (booking) => {
            this.cancelling.set(null);
            this.actionmessage.set(
              `Trip cancelled. Refund of ₹${booking?.refundAmount ?? 0} credited to your wallet.`
            );
            this.loadtrips();
          },
          error: (error) => {
            this.cancelling.set(null);
            this.actionmessage.set(
              error?.error?.error ?? 'We could not cancel this trip. Please try again.'
            );
          },
        });
      },
      error: () => {
        this.actionmessage.set('We could not fetch the refund details. Please try again.');
      },
    });
  }

  loadtrips(): void {
    const userid = this.currentcustomer()?._id;
    if (!userid) {
      return;
    }

    this.loading.set(true);
    this.loaderror.set('');

    this.busbooking.getbusmongo(userid).subscribe({
      next: (response: Booking[]) => {
        const trips = Array.isArray(response) ? response : [];
        this.mytrip.set(
          [...trips].sort((a, b) =>
            (b.bookingDate ?? '').localeCompare(a.bookingDate ?? '')
          )
        );
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to fetch trips', error);
        this.mytrip.set([]);
        this.loading.set(false);
        this.loaderror.set(
          'We could not load your trips right now. Please try again.'
        );
      },
    });
  }

  signout(): void {
    this.auth.logout();
    this.mytrip.set([]);
    this.router.navigate(['/']);
  }
}
