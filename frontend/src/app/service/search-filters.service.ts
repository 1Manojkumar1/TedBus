import { Injectable, signal } from '@angular/core';

export type SortKey =
  | 'departure'
  | 'duration'
  | 'arrival'
  | 'rating'
  | 'fare'
  | 'seats';

export interface FilterState {
  busTypes: Set<string>;
  departureSlots: Set<string>;
  sortKey: SortKey | null;
  sortDir: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class SearchFiltersService {
  private readonly _busTypes = signal<Set<string>>(new Set());
  private readonly _departureSlots = signal<Set<string>>(new Set());
  private readonly _sortKey = signal<SortKey | null>(null);
  private readonly _sortDir = signal<'asc' | 'desc'>('asc');

  readonly busTypes = this._busTypes.asReadonly();
  readonly departureSlots = this._departureSlots.asReadonly();
  readonly sortKey = this._sortKey.asReadonly();
  readonly sortDir = this._sortDir.asReadonly();

  toggleBusType(value: string): void {
    this._busTypes.update((set) => {
      const next = new Set(set);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  toggleDepartureSlot(value: string): void {
    this._departureSlots.update((set) => {
      const next = new Set(set);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  setSort(key: SortKey): void {
    if (this._sortKey() === key) {
      this._sortDir.set(this._sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this._sortKey.set(key);
      // Sensible defaults: fare/seats ascending, the rest ascending too.
      this._sortDir.set('asc');
    }
  }

  reset(): void {
    this._busTypes.set(new Set());
    this._departureSlots.set(new Set());
    this._sortKey.set(null);
    this._sortDir.set('asc');
  }
}
