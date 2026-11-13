import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  private readonly router = inject(Router);

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
}
