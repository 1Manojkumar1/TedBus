import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private readonly route = inject(ActivatedRoute);

  trip = signal({ from: '', to: '', date: '' });

  ngOnInit(): void {
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      this.trip.set({
        from: (params['from'] ?? '').toString(),
        to: (params['to'] ?? '').toString(),
        date: (params['date'] ?? '').toString().slice(0, 10),
      });
    });
  }

  formatdate(date: string): string {
    const parsed = new Date(`${date}T00:00:00`);
    if (!date || Number.isNaN(parsed.getTime())) {
      return '';
    }
    return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
}
