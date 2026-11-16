import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
import { Left } from './left/left';
import { Right } from './right/right';
import { SearchFiltersService } from '../../service/search-filters.service';
import { TranslatePipe } from '../../service/translate.pipe';

@Component({
  selector: 'app-selectbus-page',
  standalone: true,
  imports: [CommonModule, Header, Left, Right, TranslatePipe],
  templateUrl: './selectbus-page.html',
  styleUrl: './selectbus-page.css',
})
export class SelectbusPage {
  readonly filters = inject(SearchFiltersService);
  readonly isMobileFilterOpen = signal(false);

  readonly activeFiltersCount = computed(() => {
    return this.filters.busTypes().size + this.filters.departureSlots().size;
  });
}
