import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  NotificationService,
  AppNotification,
  NotificationPreference,
} from '../../service/notification.service';
import { AuthService } from '../../service/auth.service';
import { TranslationService } from '../../service/translation.service';
import { TranslatePipe } from '../../service/translate.pipe';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.css'],
})
export class NotificationCenterComponent implements OnInit {
  readonly notificationService = inject(NotificationService);
  readonly auth = inject(AuthService);
  readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);

  notifications = signal<AppNotification[]>([]);
  isLoading = signal<boolean>(false);
  selectedCategory = signal<string>('all');
  activeTab = signal<'notifications' | 'preferences'>('notifications');

  // Preferences state
  preferences = signal<NotificationPreference>({
    customerId: '',
    email: '',
    inAppEnabled: true,
    emailEnabled: true,
    pushEnabled: false,
    bookingUpdates: true,
    communityInteractions: true,
    promotionalOffers: true,
  });
  isSavingPrefs = signal<boolean>(false);
  prefSaveSuccess = signal<boolean>(false);

  readonly categories = [
    { id: 'all', label: 'All Notifications', icon: 'fa-solid fa-bell' },
    { id: 'booking', label: 'Bookings', icon: 'fa-solid fa-ticket' },
    { id: 'community', label: 'Community', icon: 'fa-solid fa-comments' },
    { id: 'payment', label: 'Payments', icon: 'fa-solid fa-credit-card' },
    { id: 'promo', label: 'Offers', icon: 'fa-solid fa-tag' },
  ];

  ngOnInit(): void {
    this.fetchNotifications();
    this.loadPreferences();
  }

  get userIdentifier(): string {
    const user = this.auth.user();
    return user?._id || user?.googleId || user?.email || '';
  }

  fetchNotifications(): void {
    if (!this.auth.isloggedin()) return;

    this.isLoading.set(true);
    const user = this.auth.user();
    this.notificationService
      .getNotifications({
        customerId: this.userIdentifier,
        email: user?.email,
        category: this.selectedCategory(),
      })
      .subscribe({
        next: (res) => {
          this.notifications.set(res.notifications);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load notifications:', err);
          this.isLoading.set(false);
        },
      });
  }

  filterCategory(cat: string): void {
    this.selectedCategory.set(cat);
    this.fetchNotifications();
  }

  markAsRead(item: AppNotification, event?: MouseEvent): void {
    event?.stopPropagation();
    if (item.read) return;

    this.notificationService.markAsRead(item._id).subscribe({
      next: () => {
        item.read = true;
        this.notifications.set([...this.notifications()]);
      },
      error: (err) => console.error('Failed to mark read:', err),
    });
  }

  markAllAsRead(): void {
    const user = this.auth.user();
    this.notificationService.markAllAsRead(this.userIdentifier, user?.email).subscribe({
      next: () => {
        const updated = this.notifications().map((n) => ({ ...n, read: true }));
        this.notifications.set(updated);
      },
      error: (err) => console.error('Failed to mark all as read:', err),
    });
  }

  deleteNotification(item: AppNotification, event?: MouseEvent): void {
    event?.stopPropagation();
    this.notificationService.deleteNotification(item._id).subscribe({
      next: () => {
        this.notifications.set(this.notifications().filter((n) => n._id !== item._id));
      },
      error: (err) => console.error('Failed to delete notification:', err),
    });
  }

  handleNotificationClick(item: AppNotification): void {
    if (!item.read) {
      this.markAsRead(item);
    }
    if (item.actionUrl) {
      this.router.navigateByUrl(item.actionUrl);
    }
  }

  loadPreferences(): void {
    if (!this.auth.isloggedin()) return;
    const user = this.auth.user();

    this.notificationService.getPreferences(this.userIdentifier, user?.email).subscribe({
      next: (prefs) => {
        this.preferences.set({
          ...prefs,
          customerId: this.userIdentifier,
          email: user?.email || '',
        });
      },
      error: () => {},
    });
  }

  savePreferences(): void {
    this.isSavingPrefs.set(true);
    this.prefSaveSuccess.set(false);

    this.notificationService.updatePreferences(this.preferences()).subscribe({
      next: (saved) => {
        this.preferences.set(saved);
        this.isSavingPrefs.set(false);
        this.prefSaveSuccess.set(true);
        setTimeout(() => this.prefSaveSuccess.set(false), 3000);
      },
      error: (err) => {
        console.error('Failed to save preferences:', err);
        this.isSavingPrefs.set(false);
      },
    });
  }

  getIconForCategory(category: string): string {
    switch (category) {
      case 'booking':
        return 'fa-solid fa-ticket text-[#5f4299] bg-purple-50 dark:bg-purple-950/40';
      case 'community':
        return 'fa-solid fa-comments text-rose-500 bg-rose-50 dark:bg-rose-950/40';
      case 'payment':
        return 'fa-solid fa-credit-card text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40';
      case 'promo':
        return 'fa-solid fa-tag text-amber-500 bg-amber-50 dark:bg-amber-950/40';
      default:
        return 'fa-solid fa-bell text-blue-500 bg-blue-50 dark:bg-blue-950/40';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.max(1, Math.floor(diff / (1000 * 60)));
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
