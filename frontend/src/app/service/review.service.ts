import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AspectRatings {
  punctuality: number;
  cleanliness: number;
  comfort: number;
  staff: number;
}

export interface JourneyReview {
  _id: string;
  bookingId: string;
  busId: string;
  route: { from: string; to: string };
  author: {
    customerId: string;
    name: string;
    email: string;
    picture?: string;
  };
  rating: number;
  aspectRatings: AspectRatings;
  headline?: string;
  comment: string;
  travelDate: string;
  isVerifiedPassenger: boolean;
  helpfulVotes: string[];
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusReviewSummary {
  reviews: JourneyReview[];
  summary: {
    totalReviews: number;
    averageRating: number;
    starCounts: Record<number, number>;
    aspectAverages: AspectRatings;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reviews`;

  createReview(data: {
    bookingId: string;
    rating: number;
    aspectRatings: AspectRatings;
    headline?: string;
    comment: string;
    author: {
      customerId: string;
      name: string;
      email: string;
      picture?: string;
    };
  }): Observable<JourneyReview> {
    return this.http.post<JourneyReview>(this.baseUrl, data);
  }

  updateReview(
    id: string,
    data: {
      rating?: number;
      aspectRatings?: AspectRatings;
      headline?: string;
      comment?: string;
      author?: { customerId: string };
    }
  ): Observable<JourneyReview> {
    return this.http.put<JourneyReview>(`${this.baseUrl}/${id}`, data);
  }

  getBusReviews(busId: string): Observable<BusReviewSummary> {
    return this.http.get<BusReviewSummary>(`${this.baseUrl}/bus/${busId}`);
  }

  getUserReviews(customerId: string): Observable<JourneyReview[]> {
    return this.http.get<JourneyReview[]>(`${this.baseUrl}/user/${customerId}`);
  }

  toggleHelpful(id: string, userId: string): Observable<{ voted: boolean; helpfulCount: number }> {
    return this.http.post<{ voted: boolean; helpfulCount: number }>(`${this.baseUrl}/${id}/vote`, { userId });
  }
}
