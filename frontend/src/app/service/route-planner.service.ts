import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RouteLocation {
  name: string;
  lat: number;
  lng: number;
}

export interface RouteOption {
  id: string;
  name: string;
  highway: string;
  distanceKm: number;
  durationMinutes: number;
  formattedDuration: string;
  trafficStatus: 'normal' | 'moderate' | 'heavy';
  trafficDelayMinutes: number;
  coordinates: [number, number][];
  waypoints: RouteLocation[];
  estimatedToll: number;
}

export interface SavedRouteItem {
  _id: string;
  customerId: string;
  title: string;
  from: RouteLocation;
  to: RouteLocation;
  waypoints: RouteLocation[];
  distanceKm: number;
  estimatedDuration: string;
  notes?: string;
  createdAt: string;
}

export const MAJOR_INDIAN_CITIES: Record<string, RouteLocation> = {
  Hyderabad: { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  Bangalore: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  Chennai: { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  Mumbai: { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  Pune: { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  Delhi: { name: 'Delhi', lat: 28.6139, lng: 77.209 },
  Jaipur: { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  Vijayawada: { name: 'Vijayawada', lat: 16.5062, lng: 80.648 },
  Visakhapatnam: { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  Coimbatore: { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  Kochi: { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
  Goa: { name: 'Goa', lat: 15.2993, lng: 74.124 },
  Kolkata: { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  Ahmedabad: { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  Tirupati: { name: 'Tirupati', lat: 13.6288, lng: 79.4192 },
  Madurai: { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
  Mysore: { name: 'Mysore', lat: 12.2958, lng: 76.6394 },
  Nagpur: { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  Surat: { name: 'Surat', lat: 21.1702, lng: 72.8311 },
  Lucknow: { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
};

@Injectable({
  providedIn: 'root',
})
export class RoutePlannerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/saved-routes`;

  getAvailableCities(): string[] {
    return Object.keys(MAJOR_INDIAN_CITIES).sort();
  }

  getCityLocation(cityName: string): RouteLocation | null {
    return MAJOR_INDIAN_CITIES[cityName] || null;
  }

  calculateDistance(from: RouteLocation, to: RouteLocation): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((to.lat - from.lat) * Math.PI) / 180;
    const dLon = ((to.lng - from.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.lat * Math.PI) / 180) *
        Math.cos((to.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const directDistance = R * c;

    // Realistic road factor: highways in India are typically ~1.22x straight-line
    return Math.round(directDistance * 1.22);
  }

  generateRoutePlans(
    from: RouteLocation,
    to: RouteLocation,
    waypoints: RouteLocation[] = []
  ): RouteOption[] {
    // Calculate total distance through waypoints
    const allStops = [from, ...waypoints, to];
    let totalBaseDistance = 0;
    for (let i = 0; i < allStops.length - 1; i++) {
      totalBaseDistance += this.calculateDistance(allStops[i], allStops[i + 1]);
    }

    // Average bus speed: 56 km/h on expressways
    const waypointDelayMinutes = waypoints.length * 25; // 25 min boarding/drop per waypoint
    const expressDurationMins = Math.round((totalBaseDistance / 58) * 60) + waypointDelayMinutes;

    // Alternate route (via older national highway): 6-10% longer distance, slower speed
    const altDistance = Math.round(totalBaseDistance * 1.08);
    const altDurationMins = Math.round((altDistance / 48) * 60) + waypointDelayMinutes + 20;

    const buildPath = (stops: RouteLocation[], jitter = 0): [number, number][] => {
      const path: [number, number][] = [];
      for (let i = 0; i < stops.length - 1; i++) {
        const p1 = stops[i];
        const p2 = stops[i + 1];
        // Interpolate points with small curve for realistic map path
        for (let step = 0; step <= 10; step++) {
          const ratio = step / 10;
          const lat = p1.lat + (p2.lat - p1.lat) * ratio;
          const lng = p1.lng + (p2.lng - p1.lng) * ratio + Math.sin(ratio * Math.PI) * jitter;
          path.push([lat, lng]);
        }
      }
      return path;
    };

    const primaryRoute: RouteOption = {
      id: 'express',
      name: 'Fastest Route (Expressway / National Corridor)',
      highway: 'NH44 / Asian Highway Network',
      distanceKm: totalBaseDistance,
      durationMinutes: expressDurationMins,
      formattedDuration: this.formatDuration(expressDurationMins),
      trafficStatus: totalBaseDistance > 500 ? 'moderate' : 'normal',
      trafficDelayMinutes: totalBaseDistance > 500 ? 25 : 10,
      coordinates: buildPath(allStops, 0.04),
      waypoints,
      estimatedToll: Math.round(totalBaseDistance * 1.6),
    };

    const alternateRoute: RouteOption = {
      id: 'state_highway',
      name: 'Scenic Route (State Highway Corridor)',
      highway: 'SH / Coastal Highway Link',
      distanceKm: altDistance,
      durationMinutes: altDurationMins,
      formattedDuration: this.formatDuration(altDurationMins),
      trafficStatus: 'normal',
      trafficDelayMinutes: 5,
      coordinates: buildPath(allStops, -0.06),
      waypoints,
      estimatedToll: Math.round(altDistance * 1.1),
    };

    return [primaryRoute, alternateRoute];
  }

  formatDuration(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  }

  // Saved Routes CRUD
  getSavedRoutes(customerId: string): Observable<SavedRouteItem[]> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.get<SavedRouteItem[]>(this.baseUrl, { params });
  }

  saveRoute(data: {
    customerId: string;
    title: string;
    from: RouteLocation;
    to: RouteLocation;
    waypoints: RouteLocation[];
    distanceKm: number;
    estimatedDuration: string;
    notes?: string;
  }): Observable<SavedRouteItem> {
    return this.http.post<SavedRouteItem>(this.baseUrl, data);
  }

  deleteSavedRoute(id: string, customerId: string): Observable<{ message: string; id: string }> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.delete<{ message: string; id: string }>(`${this.baseUrl}/${id}`, { params });
  }
}
