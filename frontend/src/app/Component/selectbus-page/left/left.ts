import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchFiltersService } from '../../../service/search-filters.service';
import { TranslatePipe } from '../../../service/translate.pipe';

@Component({
  selector: 'app-left',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './left.html',
  styleUrl: './left.css',
})
export class Left {
  readonly filters = inject(SearchFiltersService);

  toggleBusType(value: string): void {
    this.filters.toggleBusType(value);
  }

  toggleSlot(value: string): void {
    this.filters.toggleDepartureSlot(value);
  }

  hasBusType(value: string): boolean {
    return this.filters.busTypes().has(value);
  }

  hasSlot(value: string): boolean {
    return this.filters.departureSlots().has(value);
  }

  hasActiveFilters(): boolean {
    return this.filters.busTypes().size > 0 || this.filters.departureSlots().size > 0;
  }

  clearAll(): void {
    this.filters.reset();
  }
}
