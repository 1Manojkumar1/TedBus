# scripts/update_landing_page.py

ts_code = '''import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { BusService } from '../../service/bus.service';
import { TranslatePipe } from '../../service/translate.pipe';
import { TranslationService } from '../../service/translation.service';

const DEFAULT_POPULAR_ROUTES: { from: string; to: string }[] = [
  // Bangalore / Bengaluru
  { from: 'Bangalore', to: 'Hyderabad' },
  { from: 'Bangalore', to: 'Chennai' },
  { from: 'Bangalore', to: 'Goa' },
  { from: 'Bangalore', to: 'Coimbatore' },
  { from: 'Bangalore', to: 'Kochi' },
  { from: 'Bangalore', to: 'Mysore' },
  { from: 'Bangalore', to: 'Madurai' },
  { from: 'Bangalore', to: 'Tirupati' },
  { from: 'Bangalore', to: 'Vijayawada' },
  { from: 'Bangalore', to: 'Visakhapatnam' },
  { from: 'Bangalore', to: 'Mangalore' },
  { from: 'Bangalore', to: 'Udupi' },
  { from: 'Bangalore', to: 'Ooty' },
  { from: 'Bangalore', to: 'Pondicherry' },
  { from: 'Bangalore', to: 'Hubli' },
  { from: 'Bangalore', to: 'Belgaum' },
  { from: 'Bangalore', to: 'Kozhikode' },

  // Hyderabad
  { from: 'Hyderabad', to: 'Bangalore' },
  { from: 'Hyderabad', to: 'Chennai' },
  { from: 'Hyderabad', to: 'Vijayawada' },
  { from: 'Hyderabad', to: 'Visakhapatnam' },
  { from: 'Hyderabad', to: 'Tirupati' },
  { from: 'Hyderabad', to: 'Pune' },
  { from: 'Hyderabad', to: 'Mumbai' },
  { from: 'Hyderabad', to: 'Goa' },
  { from: 'Hyderabad', to: 'Nagpur' },
  { from: 'Hyderabad', to: 'Shirdi' },
  { from: 'Hyderabad', to: 'Guntur' },
  { from: 'Hyderabad', to: 'Rajahmundry' },

  // Chennai
  { from: 'Chennai', to: 'Bangalore' },
  { from: 'Chennai', to: 'Hyderabad' },
  { from: 'Chennai', to: 'Coimbatore' },
  { from: 'Chennai', to: 'Madurai' },
  { from: 'Chennai', to: 'Kochi' },
  { from: 'Chennai', to: 'Tirupati' },
  { from: 'Chennai', to: 'Vijayawada' },
  { from: 'Chennai', to: 'Pondicherry' },
  { from: 'Chennai', to: 'Trichy' },
  { from: 'Chennai', to: 'Salem' },

  // Mumbai
  { from: 'Mumbai', to: 'Pune' },
  { from: 'Mumbai', to: 'Goa' },
  { from: 'Mumbai', to: 'Ahmedabad' },
  { from: 'Mumbai', to: 'Surat' },
  { from: 'Mumbai', to: 'Udaipur' },
  { from: 'Mumbai', to: 'Indore' },
  { from: 'Mumbai', to: 'Nagpur' },
  { from: 'Mumbai', to: 'Shirdi' },
  { from: 'Mumbai', to: 'Nashik' },
  { from: 'Mumbai', to: 'Hyderabad' },

  // Pune
  { from: 'Pune', to: 'Mumbai' },
  { from: 'Pune', to: 'Goa' },
  { from: 'Pune', to: 'Ahmedabad' },
  { from: 'Pune', to: 'Surat' },
  { from: 'Pune', to: 'Indore' },
  { from: 'Pune', to: 'Nagpur' },
  { from: 'Pune', to: 'Shirdi' },
  { from: 'Pune', to: 'Kolhapur' },
  { from: 'Pune', to: 'Hyderabad' },

  // Delhi NCR
  { from: 'Delhi', to: 'Jaipur' },
  { from: 'Delhi', to: 'Agra' },
  { from: 'Delhi', to: 'Chandigarh' },
  { from: 'Delhi', to: 'Manali' },
  { from: 'Delhi', to: 'Shimla' },
  { from: 'Delhi', to: 'Dehradun' },
  { from: 'Delhi', to: 'Rishikesh' },
  { from: 'Delhi', to: 'Haridwar' },
  { from: 'Delhi', to: 'Amritsar' },
  { from: 'Delhi', to: 'Lucknow' },
  { from: 'Delhi', to: 'Varanasi' },
  { from: 'Delhi', to: 'Udaipur' },

  // Rajasthan & Gujarat
  { from: 'Jaipur', to: 'Delhi' },
  { from: 'Jaipur', to: 'Agra' },
  { from: 'Jaipur', to: 'Udaipur' },
  { from: 'Jaipur', to: 'Jodhpur' },
  { from: 'Jaipur', to: 'Ahmedabad' },
  { from: 'Ahmedabad', to: 'Mumbai' },
  { from: 'Ahmedabad', to: 'Pune' },
  { from: 'Ahmedabad', to: 'Surat' },
  { from: 'Ahmedabad', to: 'Udaipur' },
  { from: 'Ahmedabad', to: 'Jaipur' },
  { from: 'Ahmedabad', to: 'Indore' },
  { from: 'Ahmedabad', to: 'Jodhpur' },

  // Kerala & Tamil Nadu Tourism
  { from: 'Kochi', to: 'Bangalore' },
  { from: 'Kochi', to: 'Chennai' },
  { from: 'Kochi', to: 'Munnar' },
  { from: 'Kochi', to: 'Trivandrum' },
  { from: 'Kochi', to: 'Alleppey' },
  { from: 'Coimbatore', to: 'Bangalore' },
  { from: 'Coimbatore', to: 'Chennai' },
  { from: 'Coimbatore', to: 'Ooty' },
  { from: 'Madurai', to: 'Bangalore' },
  { from: 'Madurai', to: 'Chennai' },
  { from: 'Madurai', to: 'Kodaikanal' },
  { from: 'Goa', to: 'Bangalore' },
  { from: 'Goa', to: 'Mumbai' },
  { from: 'Goa', to: 'Pune' },
  { from: 'Goa', to: 'Hyderabad' },
  { from: 'Kolkata', to: 'Bhubaneswar' },
  { from: 'Kolkata', to: 'Siliguri' },
  { from: 'Bhopal', to: 'Indore' },
  { from: 'Varanasi', to: 'Lucknow' },
  { from: 'Varanasi', to: 'Delhi' },
  { from: 'Lucknow', to: 'Delhi' },
  { from: 'Chandigarh', to: 'Delhi' },
  { from: 'Chandigarh', to: 'Manali' },
  { from: 'Chandigarh', to: 'Shimla' },
  { from: 'Dehradun', to: 'Delhi' },
  { from: 'Rishikesh', to: 'Delhi' },
  { from: 'Manali', to: 'Delhi' },
  { from: 'Shimla', to: 'Delhi' },
  { from: 'Ooty', to: 'Bangalore' },
  { from: 'Ooty', to: 'Coimbatore' },
  { from: 'Pondicherry', to: 'Chennai' },
  { from: 'Pondicherry', to: 'Bangalore' },
  { from: 'Mysore', to: 'Bangalore' },
  { from: 'Tirupati', to: 'Bangalore' },
  { from: 'Tirupati', to: 'Chennai' },
  { from: 'Tirupati', to: 'Hyderabad' },
  { from: 'Vijayawada', to: 'Hyderabad' },
  { from: 'Vijayawada', to: 'Bangalore' },
  { from: 'Vijayawada', to: 'Visakhapatnam' },
  { from: 'Visakhapatnam', to: 'Hyderabad' },
  { from: 'Visakhapatnam', to: 'Vijayawada' },
  { from: 'Visakhapatnam', to: 'Bangalore' },
  { from: 'Mangalore', to: 'Bangalore' },
  { from: 'Udupi', to: 'Bangalore' },
  { from: 'Surat', to: 'Mumbai' },
  { from: 'Indore', to: 'Mumbai' },
  { from: 'Nagpur', to: 'Mumbai' },
  { from: 'Shirdi', to: 'Mumbai' },
  { from: 'Udaipur', to: 'Delhi' },
  { from: 'Agra', to: 'Delhi' },
  { from: 'Amritsar', to: 'Delhi' },
];

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslatePipe,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  private readonly router = inject(Router);
  private readonly busservice = inject(BusService);
  readonly i18n = inject(TranslationService);

  fromoption = signal('');
  tooption = signal('');
  selectedDate = signal<Date | null>(new Date());
  formerror = signal('');

  private readonly routes = signal<{ from: string; to: string }[]>(DEFAULT_POPULAR_ROUTES);

  readonly popularRoutes = [
    { from: 'Bangalore', to: 'Goa' },
    { from: 'Hyderabad', to: 'Bangalore' },
    { from: 'Mumbai', to: 'Pune' },
    { from: 'Delhi', to: 'Jaipur' },
    { from: 'Chennai', to: 'Bangalore' },
    { from: 'Pune', to: 'Goa' },
    { from: 'Delhi', to: 'Manali' },
    { from: 'Bangalore', to: 'Ooty' },
    { from: 'Kochi', to: 'Munnar' },
    { from: 'Delhi', to: 'Agra' },
    { from: 'Hyderabad', to: 'Vijayawada' },
    { from: 'Mumbai', to: 'Goa' },
  ];

  readonly fromcities = computed(() =>
    [...new Set(this.routes().map((route) => route.from))].sort()
  );

  readonly tocities = computed(() => {
    const from = this.fromoption().trim().toLowerCase();
    const relevant = from
      ? this.routes().filter((route) => route.from.toLowerCase() === from)
      : this.routes();

    return [...new Set((relevant.length ? relevant : this.routes()).map((route) => route.to))].sort();
  });

  readonly filteredFromCities = computed(() => {
    const query = this.fromoption().trim().toLowerCase();
    const all = this.fromcities();
    if (!query) return all;
    return all.filter((city) => city.toLowerCase().includes(query));
  });

  readonly filteredToCities = computed(() => {
    const query = this.tooption().trim().toLowerCase();
    const all = this.tocities();
    if (!query) return all;
    return all.filter((city) => city.toLowerCase().includes(query));
  });

  readonly datelabel = computed(() => {
    const date = this.selectedDate();
    if (!date) {
      return 'Date';
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  });

  constructor() {
    this.busservice.getroutes().subscribe({
      next: (routes) => {
        if (routes && routes.length > 0) {
          const apiRoutes = routes.map((route) => ({
            from: route.departureLocation.name,
            to: route.arrivalLocation.name,
          }));
          // Merge defaults and API routes seamlessly
          const mergedMap = new Map<string, { from: string; to: string }>();
          for (const r of [...DEFAULT_POPULAR_ROUTES, ...apiRoutes]) {
            mergedMap.set(`${r.from.toLowerCase()}->${r.to.toLowerCase()}`, r);
          }
          this.routes.set(Array.from(mergedMap.values()));
        }
      },
      error: (error) => {
        console.error('Could not load the available routes from backend, using comprehensive nationwide defaults', error);
      },
    });
  }

  selectPopularRoute(from: string, to: string): void {
    this.fromoption.set(from);
    this.tooption.set(to);
    this.formerror.set('');
  }

  gocancellation(): void {
    this.router.navigate(['/cancellation']);
  }

  fromEvent(city: string) {
    this.fromoption.set(city);
    if (this.tocities().length > 0 && this.tooption() && !this.tocities().includes(this.tooption())) {
      this.tooption.set('');
    }
    this.formerror.set('');
  }

  toEvent(city: string) {
    this.tooption.set(city);
    this.formerror.set('');
  }

  swapcities(): void {
    const from = this.fromoption();
    const to = this.tooption();
    if (!from && !to) {
      return;
    }
    this.fromoption.set(to);
    this.tooption.set(from);
    this.formerror.set('');
  }

  matchDate(event: any) {
    const value: Date | null = event.value;
    this.selectedDate.set(value ?? new Date());
  }

  submit() {
    const from = this.fromoption().trim();
    const to = this.tooption().trim();
    const date = this.selectedDate() ?? new Date();

    if (!from || !to) {
      this.formerror.set(this.i18n.translate('SEARCH.CHOOSE_CITIES'));
      return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {
      this.formerror.set(this.i18n.translate('SEARCH.SAME_CITY'));
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const picked = new Date(date);
    picked.setHours(0, 0, 0, 0);
    if (picked < today) {
      this.formerror.set(this.i18n.translate('SEARCH.FUTURE_DATE'));
      return;
    }

    this.formerror.set('');
    this.router.navigate(['/selectbus'], {
      queryParams: { from, to, date: this.localdate(date) },
    });
  }

  private localdate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
'''

with open("frontend/src/app/Component/landing-page/landing-page.ts", "w", encoding="utf-8") as f:
    f.write(ts_code)

print("Updated landing-page.ts!")
