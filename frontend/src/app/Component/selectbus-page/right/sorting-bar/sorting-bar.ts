import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { SearchFiltersService, SortKey } from '../../../../service/search-filters.service';
import { TranslatePipe } from '../../../../service/translate.pipe';

@Component({
  selector: 'app-sorting-bar',
  standalone: true,
  imports: [MatIconModule, MatDividerModule, TranslatePipe],
  templateUrl: './sorting-bar.html',
  styleUrl: './sorting-bar.css',
})
export class SortingBarComponent {
  readonly filters = inject(SearchFiltersService);

  sort(key: SortKey): void {
    this.filters.setSort(key);
  }

  isActive(key: SortKey): boolean {
    return this.filters.sortKey() === key;
  }

  direction(key: SortKey): string {
    return this.isActive(key) ? (this.filters.sortDir() === 'asc' ? '↑' : '↓') : '';
  }
}
