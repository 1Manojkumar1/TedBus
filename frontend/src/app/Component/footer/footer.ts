import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';

export type FooterMode = 'full' | 'minimal' | 'payment';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  private readonly router = inject(Router);

  readonly currentUrl = signal<string>(this.cleanUrl(this.router.url));

  // Mobile accordion state for landing page footer
  readonly isRoutesOpen = signal<boolean>(false);
  readonly isCompanyOpen = signal<boolean>(false);
  readonly isLegalOpen = signal<boolean>(false);

  readonly popularRoutes = [
    { from: 'Hyderabad', to: 'Bangalore' },
    { from: 'Bangalore', to: 'Chennai' },
    { from: 'Pune', to: 'Bangalore' },
    { from: 'Mumbai', to: 'Goa' },
    { from: 'Delhi', to: 'Agra' },
  ];

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(this.cleanUrl(event.urlAfterRedirects));
      });
  }

  readonly footerMode = computed<FooterMode>(() => {
    const url = this.currentUrl();
    if (url === '/payment') {
      return 'payment';
    }
    if (url === '' || url === '/') {
      return 'full';
    }
    return 'minimal';
  });

  toggleSection(section: 'routes' | 'company' | 'legal'): void {
    if (section === 'routes') {
      this.isRoutesOpen.update((v) => !v);
    } else if (section === 'company') {
      this.isCompanyOpen.update((v) => !v);
    } else if (section === 'legal') {
      this.isLegalOpen.update((v) => !v);
    }
  }

  searchRoute(from: string, to: string, event: Event): void {
    event.preventDefault();
    const today = new Date();
    const dateStr = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');

    this.router.navigate(['/selectbus'], {
      queryParams: { from, to, date: dateStr },
    });
  }

  handleclick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a') as HTMLAnchorElement | null;
    if (!anchor) {
      return;
    }

    const href = anchor.getAttribute('href');
    if (!href || href === '#' || href.trim() === '') {
      event.preventDefault();
      this.router.navigateByUrl('/help');
    }
  }

  private cleanUrl(rawUrl: string): string {
    const path = rawUrl.split('?')[0].split('#')[0];
    return path.replace(/\/+$/, '') || '/';
  }
}
