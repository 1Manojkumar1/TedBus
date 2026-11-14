import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewSeatsComponent } from '../../view-seats/view-seats';
import { TranslatePipe } from '../../../../../service/translate.pipe';
import { ReviewService, BusReviewSummary, JourneyReview } from '../../../../../service/review.service';
import { AuthService } from '../../../../../service/auth.service';

@Component({
  selector: 'app-bottom-tab',
  standalone: true,
  imports: [CommonModule, ViewSeatsComponent, TranslatePipe],
  templateUrl: './bottom-tab.html',
  styleUrl: './bottom-tab.css',
})
export class BottomTabComponent {
  private readonly reviewService = inject(ReviewService);
  private readonly auth = inject(AuthService);

  @Input() filledseats: number[] = [];
  @Input() seatprice: number = 0;
  @Input() routedetails: any;
  @Input() busarrivaltime: number = 0;
  @Input() busdeparturetime: number = 0;
  @Input() operatorname: string = '';
  @Input() busid: string = '';
  @Input() totalseats: number = 40;

  tabstate: boolean[] = [false, false, false, false, false];

  reviewsData = signal<BusReviewSummary | null>(null);
  isLoadingReviews = signal<boolean>(false);

  handletabstate(value: number): void {
    for (let i = 0; i < this.tabstate.length; i++) {
      this.tabstate[i] = i === value && !this.tabstate[i];
    }
    if (value === 2 && this.tabstate[2] && this.busid) {
      this.fetchReviews();
    }
  }

  fetchReviews(): void {
    if (!this.busid) return;
    this.isLoadingReviews.set(true);
    this.reviewService.getBusReviews(this.busid).subscribe({
      next: (data) => {
        this.reviewsData.set(data);
        this.isLoadingReviews.set(false);
      },
      error: () => {
        this.isLoadingReviews.set(false);
      },
    });
  }

  toggleVote(review: JourneyReview): void {
    const user = this.auth.user();
    const userId = user?._id || user?.googleId || user?.email || 'guest_voter';
    this.reviewService.toggleHelpful(review._id, userId).subscribe({
      next: (res) => {
        review.helpfulCount = res.helpfulCount;
        const idx = review.helpfulVotes.indexOf(userId);
        if (res.voted && idx === -1) {
          review.helpfulVotes.push(userId);
        } else if (!res.voted && idx !== -1) {
          review.helpfulVotes.splice(idx, 1);
        }
      },
    });
  }

  hasVoted(review: JourneyReview): boolean {
    const user = this.auth.user();
    const userId = user?._id || user?.googleId || user?.email || 'guest_voter';
    return review.helpfulVotes?.includes(userId) || false;
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
