import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService, ToastMessage } from '../../service/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  getIcon(toast: ToastMessage): string {
    if (toast.category === 'booking') return 'fa-solid fa-ticket';
    if (toast.category === 'community') return 'fa-solid fa-comments';
    if (toast.category === 'payment') return 'fa-solid fa-credit-card';
    if (toast.category === 'promo') return 'fa-solid fa-tag';

    switch (toast.type) {
      case 'success':
        return 'fa-solid fa-circle-check';
      case 'warning':
        return 'fa-solid fa-triangle-exclamation';
      case 'error':
        return 'fa-solid fa-circle-exclamation';
      default:
        return 'fa-solid fa-bell';
    }
  }

  getIconColor(toast: ToastMessage): string {
    if (toast.category === 'booking') return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50';
    if (toast.category === 'community') return 'text-purple-500 bg-purple-50 dark:bg-purple-950/50';
    if (toast.category === 'payment') return 'text-blue-500 bg-blue-50 dark:bg-blue-950/50';

    switch (toast.type) {
      case 'success':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50';
      case 'warning':
        return 'text-amber-500 bg-amber-50 dark:bg-amber-950/50';
      case 'error':
        return 'text-rose-500 bg-rose-50 dark:bg-rose-950/50';
      default:
        return 'text-[#5f4299] bg-purple-50 dark:bg-purple-950/50';
    }
  }

  handleAction(toast: ToastMessage): void {
    if (toast.id) {
      this.toastService.dismiss(toast.id);
    }
    if (toast.actionUrl) {
      this.router.navigateByUrl(toast.actionUrl);
    }
  }

  dismiss(toast: ToastMessage, event: MouseEvent): void {
    event.stopPropagation();
    if (toast.id) {
      this.toastService.dismiss(toast.id);
    }
  }
}
