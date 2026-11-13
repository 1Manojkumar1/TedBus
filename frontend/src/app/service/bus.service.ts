import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RouteSummary {
  _id: string;
  departureLocation: { name: string; subLocations: string[] };
  arrivalLocation: { name: string; subLocations: string[] };
  duration: number;
}

export interface BusSummary {
  _id: string;
  operatorName: string;
  busType: string;
  departureTime: string;
  rating: number[];
  totalSeats?: number;
  routes: string;
  images: string;
  liveTracking: number;
  reschedulable: number;
}

export interface RouteSearchResult {
  route: RouteSummary | null;
  matchedBuses: BusSummary[];
  busidwithseatobj: Record<string, number[]>;
}

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  addbusmongo(booking: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings`, booking);
  }

  cancelbooking(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bookings/${id}/cancel`, {});
  }

  getrefundquote(id: string): Observable<{ refundAmount: number; eligible: boolean; fare: number }> {
    return this.http.get<{ refundAmount: number; eligible: boolean; fare: number }>(
      `${this.apiUrl}/bookings/${id}/refund-quote`
    );
  }

  getpaymentconfig(): Observable<{ mode: string; stripeConfigured: boolean; currency: string }> {
    return this.http.get<{ mode: string; stripeConfigured: boolean; currency: string }>(
      `${this.apiUrl}/payments/config`
    );
  }

  createcheckout(booking: any): Observable<{
    mode: string;
    booking?: any;
    bookingId?: string;
    checkoutUrl?: string;
  }> {
    return this.http.post<{
      mode: string;
      booking?: any;
      bookingId?: string;
      checkoutUrl?: string;
    }>(`${this.apiUrl}/payments/checkout`, booking);
  }

  getbusmongo(customerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/bookings/${customerId}`);
  }

  getroutes(): Observable<RouteSummary[]> {
    return this.http.get<RouteSummary[]>(`${this.apiUrl}/routes`);
  }

  getbusesfordate(departure: string, arrival: string, date: string): Observable<RouteSearchResult> {
    return this.http.get<RouteSearchResult>(
      `${this.apiUrl}/routes/${encodeURIComponent(departure)}/${encodeURIComponent(arrival)}/${encodeURIComponent(date)}`
    );
  }
}
