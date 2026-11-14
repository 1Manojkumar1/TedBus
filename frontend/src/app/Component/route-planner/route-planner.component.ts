import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  inject,
  signal,
  ElementRef,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import {
  RoutePlannerService,
  RouteLocation,
  RouteOption,
  SavedRouteItem,
} from '../../service/route-planner.service';
import { AuthService } from '../../service/auth.service';
import { TranslationService } from '../../service/translation.service';
import { TranslatePipe } from '../../service/translate.pipe';

@Component({
  selector: 'app-route-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './route-planner.component.html',
  styleUrls: ['./route-planner.component.css'],
})
export class RoutePlannerComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly routeService = inject(RoutePlannerService);
  readonly auth = inject(AuthService);
  readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);

  private readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapRef');
  private map?: L.Map;
  private routePolyline?: L.Polyline;
  private markers: L.Marker[] = [];

  cities: string[] = [];

  selectedFrom = signal<string>('Hyderabad');
  selectedTo = signal<string>('Bangalore');
  waypoints = signal<string[]>([]);

  routeOptions = signal<RouteOption[]>([]);
  activeRoute = signal<RouteOption | null>(null);

  savedRoutes = signal<SavedRouteItem[]>([]);
  isSavingRoute = signal<boolean>(false);
  saveSuccessMessage = signal<string>('');
  showSaveDialog = signal<boolean>(false);
  saveTitle = signal<string>('');

  activeTab = signal<'plan' | 'saved'>('plan');

  ngOnInit(): void {
    this.cities = this.routeService.getAvailableCities();
    if (this.auth.isloggedin()) {
      this.loadSavedRoutes();
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.calculateRoute();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  get userIdentifier(): string {
    const user = this.auth.user();
    return user?._id || user?.googleId || user?.email || '';
  }

  private initMap(): void {
    const el = this.mapContainer()?.nativeElement;
    if (!el || this.map) return;

    // Centered on India
    this.map = L.map(el, {
      center: [17.385, 78.4867],
      zoom: 6,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(this.map);
  }

  calculateRoute(): void {
    const fromLoc = this.routeService.getCityLocation(this.selectedFrom());
    const toLoc = this.routeService.getCityLocation(this.selectedTo());

    if (!fromLoc || !toLoc) return;

    if (this.selectedFrom() === this.selectedTo()) {
      alert('Origin and destination cannot be the same city.');
      return;
    }

    const waypointLocs: RouteLocation[] = [];
    for (const wp of this.waypoints()) {
      const loc = this.routeService.getCityLocation(wp);
      if (loc) waypointLocs.push(loc);
    }

    const options = this.routeService.generateRoutePlans(fromLoc, toLoc, waypointLocs);
    this.routeOptions.set(options);
    this.selectRouteOption(options[0]);
  }

  selectRouteOption(option: RouteOption): void {
    this.activeRoute.set(option);
    this.drawRouteOnMap(option);
  }

  private drawRouteOnMap(option: RouteOption): void {
    if (!this.map) return;

    // Remove existing polylines & markers
    if (this.routePolyline) {
      this.map.removeLayer(this.routePolyline);
    }
    for (const m of this.markers) {
      this.map.removeLayer(m);
    }
    this.markers = [];

    const coords = option.coordinates;
    if (!coords || coords.length === 0) return;

    // Draw Polyline
    this.routePolyline = L.polyline(coords, {
      color: '#5f4299',
      weight: 5,
      opacity: 0.85,
      dashArray: option.id === 'state_highway' ? '6, 8' : undefined,
    }).addTo(this.map);

    // Fit map bounds
    this.map.fitBounds(this.routePolyline.getBounds(), { padding: [50, 50] });

    // Add Start Marker (Green circle pin)
    const startIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color: #10b981; color: white; width: 28px; height: 28px; border-radius: 50%; display: grid; place-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 11px;">A</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    const startCoord = coords[0];
    const startMarker = L.marker(startCoord, { icon: startIcon })
      .bindPopup(`<b>Origin:</b> ${this.selectedFrom()}`)
      .addTo(this.map);
    this.markers.push(startMarker);

    // Add Waypoint Markers (Amber)
    for (let i = 0; i < option.waypoints.length; i++) {
      const wp = option.waypoints[i];
      const wpIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: #f59e0b; color: white; width: 22px; height: 22px; border-radius: 50%; display: grid; place-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 10px;">${i + 1}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const wpMarker = L.marker([wp.lat, wp.lng], { icon: wpIcon })
        .bindPopup(`<b>Stop:</b> ${wp.name}`)
        .addTo(this.map);
      this.markers.push(wpMarker);
    }

    // Add End Marker (Red circle pin)
    const endIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background-color: #d84e55; color: white; width: 28px; height: 28px; border-radius: 50%; display: grid; place-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 11px;">B</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    const endCoord = coords[coords.length - 1];
    const endMarker = L.marker(endCoord, { icon: endIcon })
      .bindPopup(`<b>Destination:</b> ${this.selectedTo()}`)
      .addTo(this.map);
    this.markers.push(endMarker);
  }

  addWaypoint(): void {
    if (this.waypoints().length >= 3) {
      alert('You can add up to 3 intermediate waypoints.');
      return;
    }
    const unused = this.cities.find(
      (c) => c !== this.selectedFrom() && c !== this.selectedTo() && !this.waypoints().includes(c)
    );
    if (unused) {
      this.waypoints.set([...this.waypoints(), unused]);
      this.calculateRoute();
    }
  }

  removeWaypoint(index: number): void {
    const list = [...this.waypoints()];
    list.splice(index, 1);
    this.waypoints.set(list);
    this.calculateRoute();
  }

  updateWaypoint(index: number, city: string): void {
    const list = [...this.waypoints()];
    list[index] = city;
    this.waypoints.set(list);
    this.calculateRoute();
  }

  swapCities(): void {
    const temp = this.selectedFrom();
    this.selectedFrom.set(this.selectedTo());
    this.selectedTo.set(temp);
    this.calculateRoute();
  }

  searchBusesOnRoute(): void {
    const today = new Date().toISOString().split('T')[0];
    this.router.navigate(['/selectbus'], {
      queryParams: {
        from: this.selectedFrom(),
        to: this.selectedTo(),
        date: today,
      },
    });
  }

  // Save Route
  openSaveDialog(): void {
    if (!this.auth.isloggedin()) {
      alert('Please sign in to save your favorite routes.');
      return;
    }
    this.saveTitle.set(`${this.selectedFrom()} to ${this.selectedTo()}`);
    this.showSaveDialog.set(true);
  }

  confirmSaveRoute(): void {
    const fromLoc = this.routeService.getCityLocation(this.selectedFrom());
    const toLoc = this.routeService.getCityLocation(this.selectedTo());
    const route = this.activeRoute();

    if (!fromLoc || !toLoc || !route) return;

    const waypointLocs: RouteLocation[] = [];
    for (const wp of this.waypoints()) {
      const loc = this.routeService.getCityLocation(wp);
      if (loc) waypointLocs.push(loc);
    }

    this.isSavingRoute.set(true);
    this.routeService
      .saveRoute({
        customerId: this.userIdentifier,
        title: this.saveTitle(),
        from: fromLoc,
        to: toLoc,
        waypoints: waypointLocs,
        distanceKm: route.distanceKm,
        estimatedDuration: route.formattedDuration,
      })
      .subscribe({
        next: (saved) => {
          this.savedRoutes.set([saved, ...this.savedRoutes()]);
          this.isSavingRoute.set(false);
          this.showSaveDialog.set(false);
          this.saveSuccessMessage.set('Route saved to your profile!');
          setTimeout(() => this.saveSuccessMessage.set(''), 3000);
        },
        error: (err) => {
          console.error('Failed to save route:', err);
          alert('Failed to save route.');
          this.isSavingRoute.set(false);
        },
      });
  }

  loadSavedRoutes(): void {
    this.routeService.getSavedRoutes(this.userIdentifier).subscribe({
      next: (routes) => this.savedRoutes.set(routes),
      error: () => {},
    });
  }

  applySavedRoute(item: SavedRouteItem): void {
    this.selectedFrom.set(item.from.name);
    this.selectedTo.set(item.to.name);
    this.waypoints.set(item.waypoints?.map((w) => w.name) || []);
    this.activeTab.set('plan');
    this.calculateRoute();
  }

  deleteSavedRoute(item: SavedRouteItem, event?: MouseEvent): void {
    event?.stopPropagation();
    if (!confirm(`Delete saved route "${item.title}"?`)) return;

    this.routeService.deleteSavedRoute(item._id, this.userIdentifier).subscribe({
      next: () => {
        this.savedRoutes.set(this.savedRoutes().filter((r) => r._id !== item._id));
      },
      error: (err) => console.error('Failed to delete route:', err),
    });
  }
}
