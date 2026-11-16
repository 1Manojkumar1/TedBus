import { Component, OnInit, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { BusService } from '../../service/bus.service';
import { AuthService } from '../../service/auth.service';
import { ReviewService, JourneyReview } from '../../service/review.service';
import { CommunityService, UserCommunityStats, CommunityPost } from '../../service/community.service';
import { ToastService } from '../../service/toast.service';
import { ConfirmDialogService } from '../../service/confirm-dialog.service';
import { TranslatePipe } from '../../service/translate.pipe';
import { Booking } from '../../model/booking.model';
import { MyTrip } from './my-trip/my-trip';

type ProfileView = 'trips' | 'profile' | 'community' | 'wallet';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink, MyTrip, TranslatePipe],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  private readonly busbooking = inject(BusService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly reviewService = inject(ReviewService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly communityService = inject(CommunityService);

  showReviewModal = signal(false);
  reviewingBooking = signal<Booking | null>(null);
  isSubmittingReview = signal(false);
  isEditingReview = signal(false);
  editingReviewId = signal<string | null>(null);
  userReviews = signal<Record<string, JourneyReview>>({});

  userCommunityStats = signal<UserCommunityStats | null>(null);
  userCommunityPosts = signal<CommunityPost[]>([]);
  isLoadingCommunity = signal(false);

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

  constructor() {
    effect(() => {
      const user = this.currentcustomer();
      if (user?._id) {
        this.loadtrips();
        this.loadCommunityActivity();
      }
    });
  }

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
    if (selected === 'community' && !this.userCommunityStats()) {
      this.loadCommunityActivity();
    }
  }

  loadCommunityActivity(): void {
    const user = this.currentcustomer();
    const customerId = user?._id || user?.googleId || user?.email;
    if (!customerId) return;

    this.isLoadingCommunity.set(true);
    this.communityService.getUserStats(customerId, user?.email).subscribe({
      next: (stats) => this.userCommunityStats.set(stats),
      error: () => {},
    });

    this.communityService.getPosts({ authorId: customerId, limit: 20 }).subscribe({
      next: (res) => {
        this.userCommunityPosts.set(res.posts || []);
        this.isLoadingCommunity.set(false);
      },
      error: () => this.isLoadingCommunity.set(false),
    });
  }

  getBadgeColor(badge?: string): string {
    switch (badge) {
      case 'Top Contributor':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700';
      case 'Verified Traveler':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      case 'Route Explorer':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
  }

  ngOnInit(): void {
    if (this.currentcustomer()?._id) {
      this.loadtrips();
      this.loadCommunityActivity();
    }
  }

  async canceltrip(bookingid: string): Promise<void> {
    if (this.cancelling()) {
      return;
    }

    const confirmed = await this.confirmDialog.confirm({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking? This will release your seat and credit any eligible refund to your wallet.',
      confirmText: 'Yes, Cancel Trip',
      cancelText: 'Keep Ticket',
      type: 'danger',
      icon: 'fa-solid fa-ticket',
    });

    if (!confirmed) {
      return;
    }

    this.cancelling.set(bookingid);
    this.actionmessage.set('');
    this.busbooking.cancelbooking(bookingid).subscribe({
      next: () => {
        this.cancelling.set(null);
        this.actionmessage.set('Trip cancelled and removed from your account.');
        this.toastService.info('Booking Cancelled', 'Your ticket was cancelled and refund credited.');
        this.loadtrips();
      },
      error: (error) => {
        this.cancelling.set(null);
        const errText = error?.error?.error ?? 'We could not cancel this trip. Please try again.';
        this.actionmessage.set(errText);
        this.toastService.error('Cancellation Failed', errText);
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
        this.loadUserReviews(userid);
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

  loadUserReviews(userid: string): void {
    this.reviewService.getUserReviews(userid).subscribe({
      next: (reviews) => {
        const map: Record<string, JourneyReview> = {};
        for (const r of reviews) {
          if (r.bookingId) {
            map[r.bookingId] = r;
          }
        }
        this.userReviews.set(map);
      },
      error: (err) => console.error('Failed to load user reviews:', err),
    });
  }

  openReviewModal(booking: Booking): void {
    if (booking.status === 'cancelled') {
      this.toastService.warning('Cannot Review', 'Cancelled journeys are not eligible for review.');
      return;
    }

    const travelDate = booking.departureDetails?.date || booking.bookingDate;
    const isPastDate = travelDate && new Date(travelDate + 'T23:59:59').getTime() <= Date.now();
    if (booking.status !== 'completed' && !isPastDate) {
      this.toastService.info('Journey Incomplete', 'Reviews can only be submitted after successfully completing your journey.');
      return;
    }

    this.reviewingBooking.set(booking);
    const existing = this.userReviews()[booking._id];

    if (existing) {
      const hoursSince = (Date.now() - new Date(existing.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursSince > 24) {
        this.toastService.warning('Edit Window Closed', 'Reviews cannot be modified after 24 hours from submission.');
        return;
      }
      this.isEditingReview.set(true);
      this.editingReviewId.set(existing._id);
      this.reviewForm = {
        rating: existing.rating,
        punctuality: existing.aspectRatings?.punctuality ?? 5,
        cleanliness: existing.aspectRatings?.cleanliness ?? 5,
        comfort: existing.aspectRatings?.comfort ?? 5,
        staff: existing.aspectRatings?.staff ?? 5,
        headline: existing.headline ?? '',
        comment: existing.comment ?? '',
      };
    } else {
      this.isEditingReview.set(false);
      this.editingReviewId.set(null);
      this.reviewForm = {
        rating: 5,
        punctuality: 5,
        cleanliness: 5,
        comfort: 5,
        staff: 5,
        headline: '',
        comment: '',
      };
    }
    this.showReviewModal.set(true);
  }

  get commentLength(): number {
    return (this.reviewForm.comment || '').trim().length;
  }

  submitReview(): void {
    const booking = this.reviewingBooking();
    const user = this.currentcustomer();
    if (!booking || !user) return;

    if (this.reviewForm.comment.trim().length < 15) {
      this.toastService.warning('Review Too Short', 'Please write at least 15 characters to provide meaningful feedback.');
      return;
    }

    this.isSubmittingReview.set(true);

    if (this.isEditingReview() && this.editingReviewId()) {
      // Edit existing review
      this.reviewService
        .updateReview(this.editingReviewId()!, {
          rating: this.reviewForm.rating,
          aspectRatings: {
            punctuality: this.reviewForm.punctuality,
            cleanliness: this.reviewForm.cleanliness,
            comfort: this.reviewForm.comfort,
            staff: this.reviewForm.staff,
          },
          headline: this.reviewForm.headline,
          comment: this.reviewForm.comment,
          author: { customerId: user._id || user.googleId || user.email, email: user.email },
        })
        .subscribe({
          next: (updated) => {
            this.isSubmittingReview.set(false);
            this.showReviewModal.set(false);
            const current = { ...this.userReviews() };
            current[booking._id] = updated;
            this.userReviews.set(current);
            this.actionmessage.set('Your journey review has been updated!');
            this.toastService.success('Review Updated! ⭐', 'Your feedback has been saved.');
          },
          error: (err) => {
            this.isSubmittingReview.set(false);
            this.toastService.error('Review Update Failed', err?.error?.error || 'Failed to update review.');
          },
        });
    } else {
      // Create new review
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
          next: (created) => {
            this.isSubmittingReview.set(false);
            this.showReviewModal.set(false);
            const current = { ...this.userReviews() };
            current[booking._id] = created;
            this.userReviews.set(current);
            this.actionmessage.set('Thank you! Your verified passenger review has been published.');
            this.toastService.success('Review Published! ⭐', 'Your verified passenger review is live.');
          },
          error: (err) => {
            this.isSubmittingReview.set(false);
            this.toastService.error('Review Submission Failed', err?.error?.error || 'Failed to submit review.');
          },
        });
    }
  }

  signout(): void {
    this.auth.logout();
    this.mytrip.set([]);
    this.router.navigate(['/']);
  }
}
