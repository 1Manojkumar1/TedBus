import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { BusService } from '../../service/bus.service';
import { AuthService } from '../../service/auth.service';
import { ReviewService } from '../../service/review.service';
import { Booking } from '../../model/booking.model';
import { MyTrip } from './my-trip/my-trip';

type ProfileView = 'trips' | 'profile' | 'wallet';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink, MyTrip],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  private readonly busbooking = inject(BusService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly reviewService = inject(ReviewService);

  showReviewModal = signal(false);
  reviewingBooking = signal<Booking | null>(null);
  isSubmittingReview = signal(false);
  reviewForm = {
    rating: 5,
    punctuality: 5,
    cleanliness: 5,
    comfort: 5,
    staff: 5,
    headline: '',
    comment: '',
  };

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

    const confirmed = window.confirm('Are you sure you want to cancel and delete this booking?');
    if (!confirmed) {
      return;
    }

    this.cancelling.set(bookingid);
    this.actionmessage.set('');
    this.busbooking.cancelbooking(bookingid).subscribe({
      next: () => {
        this.cancelling.set(null);
        this.actionmessage.set('Trip cancelled and removed from your account.');
        this.loadtrips();
      },
      error: (error) => {
        this.cancelling.set(null);
        this.actionmessage.set(
          error?.error?.error ?? 'We could not cancel this trip. Please try again.'
        );
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

  openReviewModal(booking: Booking): void {
    this.reviewingBooking.set(booking);
    this.reviewForm = {
      rating: 5,
      punctuality: 5,
      cleanliness: 5,
      comfort: 5,
      staff: 5,
      headline: '',
      comment: '',
    };
    this.showReviewModal.set(true);
  }

  submitReview(): void {
    const booking = this.reviewingBooking();
    const user = this.currentcustomer();
    if (!booking || !user) return;

    if (!this.reviewForm.comment.trim()) {
      alert('Please write a short review sharing your experience.');
      return;
    }

    this.isSubmittingReview.set(true);
    this.reviewService
      .createReview({
        bookingId: booking._id,
        rating: this.reviewForm.rating,
        aspectRatings: {
          punctuality: this.reviewForm.punctuality,
          cleanliness: this.reviewForm.cleanliness,
          comfort: this.reviewForm.comfort,
          staff: this.reviewForm.staff,
        },
        headline: this.reviewForm.headline,
        comment: this.reviewForm.comment,
        author: {
          customerId: user._id || user.googleId || user.email,
          name: user.name || 'Verified Passenger',
          email: user.email,
          picture: user.picture,
        },
      })
      .subscribe({
        next: () => {
          this.isSubmittingReview.set(false);
          this.showReviewModal.set(false);
          this.actionmessage.set('Thank you! Your verified passenger review has been published.');
        },
        error: (err) => {
          this.isSubmittingReview.set(false);
          alert(err?.error?.error || 'Failed to submit review.');
        },
      });
  }

  signout(): void {
    this.auth.logout();
    this.mytrip.set([]);
    this.router.navigate(['/']);
  }
}
