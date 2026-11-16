import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id?: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  category?: 'booking' | 'community' | 'payment' | 'trip' | 'promo' | 'system';
  actionUrl?: string;
  actionLabel?: string;
  duration?: number; // in milliseconds, default 5000
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);

  show(toast: ToastMessage): void {
    const id = toast.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = {
      ...toast,
      id,
      type: toast.type || 'info',
      duration: toast.duration ?? 4000,
      createdAt: new Date(),
    };

    // Limit max 2 toasts at a time to prevent stacking and screen obstruction
    this.toasts.update((current) => [newToast, ...current].slice(0, 2));

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, newToast.duration);
    }
  }

  success(title: string, message: string, actionUrl?: string, actionLabel?: string): void {
    this.show({ title, message, type: 'success', category: 'booking', actionUrl, actionLabel });
  }

  info(title: string, message: string, actionUrl?: string, actionLabel?: string): void {
    this.show({ title, message, type: 'info', category: 'system', actionUrl, actionLabel });
  }

  warning(title: string, message: string): void {
    this.show({ title, message, type: 'warning' });
  }

  error(title: string, message: string): void {
    this.show({ title, message, type: 'error' });
  }

  dismiss(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
