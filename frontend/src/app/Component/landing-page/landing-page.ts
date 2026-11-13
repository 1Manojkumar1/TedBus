import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { BusService } from '../../service/bus.service';

@Component({
  selector: 'app-landing-page',
  imports: [FormsModule, MatMenuModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  private readonly router = inject(Router);
  private readonly busservice = inject(BusService);

  fromoption = signal('');
  tooption = signal('');
  selectedDate = signal<Date | null>(new Date());
  formerror = signal('');

  private readonly routes = signal<{ from: string; to: string }[]>([]);

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
        this.routes.set(
          routes.map((route) => ({
            from: route.departureLocation.name,
            to: route.arrivalLocation.name,
          }))
        );
      },
      error: (error) => {
        console.error('Could not load the available routes', error);
      },
    });
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
      this.formerror.set('Choose both a source and a destination city.');
      return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {
      this.formerror.set('Source and destination cannot be the same city.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const picked = new Date(date);
    picked.setHours(0, 0, 0, 0);
    if (picked < today) {
      this.formerror.set('Please choose today or a future travel date.');
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
