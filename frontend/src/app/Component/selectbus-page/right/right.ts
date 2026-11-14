import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

import { SortingBarComponent } from './sorting-bar/sorting-bar';
import { BusBoxComponent } from './bus-box/bus-box';
import { ActivatedRoute } from '@angular/router';
import { BusService, RouteSummary } from '../../../service/bus.service';
import { DataserviceService } from '../../../service/dataservice.service';
import { SearchFiltersService } from '../../../service/search-filters.service';
import { TranslatePipe } from '../../../service/translate.pipe';
import {
  departureSlot,
  enrichBus,
  isAC,
  isSleeper,
} from '../../../model/bus.util';

@Component({
  selector: 'app-right',
  standalone: true,
  imports: [CommonModule, SortingBarComponent, BusBoxComponent, TranslatePipe],
  templateUrl: './right.html',
  styleUrl: './right.css',
})
export class Right {
  private readonly route = inject(ActivatedRoute);
  private readonly busservice = inject(BusService);
  private readonly dataservice = inject(DataserviceService);
  readonly filters = inject(SearchFiltersService);

  buses = signal<any[]>([]);
  routeinfo = signal<RouteSummary | null>(null);

  readonly visibleBuses = computed(() => {
    const route = this.routeinfo();
    const types = this.filters.busTypes();
    const slots = this.filters.departureSlots();
    const sortKey = this.filters.sortKey();
    const sortDir = this.filters.sortDir();

    const enriched = this.buses().map((bus) => ({
      bus,
      view: enrichBus(bus, route, bus.filledseats ?? []),
    }));

    const filtered = enriched.filter(({ view }) => {
      if (types.size > 0) {
        const matches = [...types].some((type) => {
          switch (type) {
            case 'ac':
              return isAC(view.busType);
            case 'nonac':
              return !isAC(view.busType);
            case 'sleeper':
              return isSleeper(view.busType);
            case 'seater':
              return !isSleeper(view.busType);
            default:
              return true;
          }
        });
        if (!matches) {
          return false;
        }
      }

      if (slots.size > 0) {
        if (!slots.has(departureSlot(view.departurehours))) {
          return false;
        }
      }

      return true;
    });

    if (sortKey) {
      const factor = sortDir === 'asc' ? 1 : -1;
      filtered.sort((a, b) => {
        let result = 0;
        switch (sortKey) {
          case 'departure':
            result = a.view.departurehours - b.view.departurehours;
            break;
          case 'duration':
            result = a.view.duration - b.view.duration;
            break;
          case 'arrival':
            result = a.view.arrivalhours - b.view.arrivalhours;
            break;
          case 'rating':
            result = a.view.avgrating - b.view.avgrating;
            break;
          case 'fare':
            result = a.view.seatprice - b.view.seatprice;
            break;
          case 'seats':
            result = a.view.seatsavailable - b.view.seatsavailable;
            break;
        }
        return result * factor;
      });
    }

    return filtered.map(({ bus }) => bus);
  });
  seats = signal<Record<string, number[]>>({});
  loading = signal(true);
  loaderror = signal('');
  search = signal({ from: '', to: '', date: '' });

  constructor() {
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      const from = (params['from'] ?? params['departure'] ?? '').toString().trim();
      const to = (params['to'] ?? params['arrival'] ?? '').toString().trim();
      const date = this.normalizedate(params['date']);
      this.search.set({ from, to, date });
      this.dataservice.setsearchdate(date);

      if (!from || !to) {
        this.loading.set(false);
        this.loaderror.set('Choose where you are travelling from and to.');
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const picked = new Date(`${date}T00:00:00`);
      if (!Number.isNaN(picked.getTime()) && picked < today) {
        this.loading.set(false);
        this.loaderror.set('Travel date cannot be in the past.');
        return;
      }

      this.loadbuses(from, to, date);
    });
  }

  loadbuses(from: string, to: string, date: string): void {
    this.loading.set(true);
    this.loaderror.set('');

    this.busservice.getbusesfordate(from, to, date).subscribe({
      next: (response) => {
        this.routeinfo.set(response.route);
        this.seats.set(response.busidwithseatobj ?? {});
        this.buses.set(
          (response.matchedBuses ?? []).map((bus) => ({
            ...bus,
            filledseats: response.busidwithseatobj?.[bus._id] ?? [],
          }))
        );
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Could not load buses', error);
        this.routeinfo.set(null);
        this.buses.set([]);
        this.loading.set(false);
        this.loaderror.set(
          error?.status === 404
            ? `No buses are running from ${from} to ${to} on this date.`
            : 'We could not load buses right now. Please try again.'
        );
      },
    });
  }

  retry(): void {
    const { from, to, date } = this.search();
    if (from && to) {
      this.loadbuses(from, to, date);
    }
  }

  formatdate(date: string): string {
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }
    return parsed.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  private normalizedate(value: unknown): string {
    const raw = (value ?? '').toString().trim();
    if (raw.length >= 10) {
      return raw.slice(0, 10);
    }
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
