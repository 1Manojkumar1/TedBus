import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-info-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './info-page.html',
  styleUrl: './info-page.css',
})
export class InfoPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly topic = this.route.snapshot.data['topic'] ?? 'help';

  readonly content: Record<string, { title: string; body: string[] }> = {
    help: {
      title: 'Help & support',
      body: [
        'Tedbus is a demo bus booking app. Search buses, pick seats, pay and manage trips from your account.',
        'For booking issues, check My Trips after signing in. Cancellations are available up to departure.',
        'Email support: support@tedbus.test (demo).',
      ],
    },
    cancellation: {
      title: 'Cancellation & refunds',
      body: [
        'You can cancel an upcoming trip from My Trips.',
        'Refunds: 90% if cancelled more than 24 hours before departure, 50% between 6 and 24 hours, 0% within 6 hours.',
        'Refunds are credited to your Tedbus wallet.',
      ],
    },
  };
}
