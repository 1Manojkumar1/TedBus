import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  NotificationService,
  AppNotification,
  NotificationPreference,
} from '../../service/notification.service';
import { AuthService } from '../../service/auth.service';
import { TranslationService } from '../../service/translation.service';
import { ToastService } from '../../service/toast.service';
import { TranslatePipe } from '../../service/translate.pipe';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.css'],
})
export class NotificationCenterComponent implements OnInit {
  readonly notificationService = inject(NotificationService);
  readonly auth = inject(AuthService);
  readonly i18n = inject(TranslationService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  notifications = signal<AppNotification[]>([]);
  isLoading = signal<boolean>(false);
  selectedCategory = signal<string>('all');
  activeTab = signal<'notifications' | 'preferences'>('notifications');
  expandedIds = signal<Set<string>>(new Set<string>());

  // Action feedback states
  isTestingChannel = signal<boolean>(false);
  testStatus = signal<string>('');
  isScanningJourneys = signal<boolean>(false);
  isRetryingDeliveries = signal<boolean>(false);

  // Preferences state
  preferences = signal<NotificationPreference>({
    customerId: '',
    email: '',
    inAppEnabled: true,
    emailEnabled: true,
    pushEnabled: false,
    bookingUpdates: true,
    journeyReminders: true,
    scheduleChanges: true,
    communityInteractions: true,
    promotionalOffers: true,
    preferredLanguage: 'en',
  });
  isSavingPrefs = signal<boolean>(false);
  prefSaveSuccess = signal<boolean>(false);

  readonly categories = [
    { id: 'all', label: 'All Notifications', icon: 'fa-solid fa-bell' },
    { id: 'booking', label: 'Bookings', icon: 'fa-solid fa-ticket' },
    { id: 'trip', label: 'Journey & Schedules', icon: 'fa-solid fa-bus' },
    { id: 'community', label: 'Community', icon: 'fa-solid fa-comments' },
    { id: 'payment', label: 'Payments', icon: 'fa-solid fa-credit-card' },
    { id: 'promo', label: 'Offers', icon: 'fa-solid fa-tag' },
  ];

  readonly supportedLanguages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
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
        this.toastService.success('Done', 'All notifications marked as read.');
      },
      error: (err) => console.error('Failed to mark all as read:', err),
    });
  }

  deleteNotification(item: AppNotification, event?: MouseEvent): void {
    event?.stopPropagation();
    this.notificationService.deleteNotification(item._id).subscribe({
      next: () => {
        this.notifications.set(this.notifications().filter((n) => n._id !== item._id));
        this.toastService.info('Removed', 'Notification deleted.');
      },
      error: (err) => console.error('Failed to delete notification:', err),
    });
  }

  isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  toggleExpand(item: AppNotification, event?: MouseEvent): void {
    event?.stopPropagation();
    if (!item.read) {
      this.markAsRead(item);
    }
    const current = new Set(this.expandedIds());
    if (current.has(item._id)) {
      current.delete(item._id);
    } else {
      current.add(item._id);
    }
    this.expandedIds.set(current);
  }

  formatRef(val: unknown): string {
    const str = String(val ?? '');
    return str.length > 8 ? str.slice(-8).toUpperCase() : str;
  }

  formatSeats(val: unknown): string {
    if (Array.isArray(val)) return val.join(', ');
    return String(val ?? '');
  }

  handleNotificationClick(item: AppNotification): void {
    this.toggleExpand(item);
  }

  selectLanguage(code: string): void {
    this.preferences.update((p) => ({
      ...p,
      preferredLanguage: code as 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml',
    }));
    this.savePreferences();
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
          preferredLanguage: prefs.preferredLanguage || this.i18n.currentLanguage() || 'en',
          journeyReminders: prefs.journeyReminders ?? true,
          scheduleChanges: prefs.scheduleChanges ?? true,
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
        this.toastService.success('Preferences Saved', 'Your notification settings have been updated.');
        setTimeout(() => this.prefSaveSuccess.set(false), 3000);
      },
      error: (err) => {
        console.error('Failed to save preferences:', err);
        this.isSavingPrefs.set(false);
        this.toastService.error('Save Failed', 'Unable to update preferences right now.');
      },
    });
  }

  async onTogglePush(): Promise<void> {
    const current = this.preferences();
    if (!current.pushEnabled) {
      // User turned on push
      const granted = await this.notificationService.requestPushPermission();
      if (granted) {
        this.preferences.update((p) => ({ ...p, pushEnabled: true }));
        this.savePreferences();
      } else {
        this.preferences.update((p) => ({ ...p, pushEnabled: false }));
        this.toastService.warning(
          'Push Blocked',
          'Please allow notifications in your browser site permissions.'
        );
      }
    } else {
      this.preferences.update((p) => ({ ...p, pushEnabled: false }));
      this.savePreferences();
    }
  }

  sendTestNotification(): void {
    if (!this.auth.isloggedin()) {
      this.toastService.warning('Sign in', 'Please sign in to test notification channels.');
      return;
    }

    this.isTestingChannel.set(true);
    const user = this.auth.user();
    this.notificationService
      .sendTestNotification(this.userIdentifier, user?.email)
      .subscribe({
        next: (res) => {
          this.isTestingChannel.set(false);
          this.toastService.success(
            'Test Dispatched!',
            'Check In-App, Email, and Browser Push alerts.'
          );
          // Refresh list to show test alert in feed
          this.fetchNotifications();
        },
        error: (err) => {
          this.isTestingChannel.set(false);
          this.toastService.error('Test Failed', 'Could not deliver test notification.');
        },
      });
  }

  triggerUpcomingReminders(): void {
    this.isScanningJourneys.set(true);
    this.notificationService.triggerUpcomingReminders().subscribe({
      next: (res) => {
        this.isScanningJourneys.set(false);
        this.toastService.info(
          'Journey Scan Complete',
          `Scanned ${res.scanned} active bookings. Reminders sent: ${res.remindersSent}.`
        );
        this.fetchNotifications();
      },
      error: () => {
        this.isScanningJourneys.set(false);
      },
    });
  }

  retryFailedDeliveries(): void {
    this.isRetryingDeliveries.set(true);
    this.notificationService.retryFailedDeliveries().subscribe({
      next: (res) => {
        this.isRetryingDeliveries.set(false);
        this.toastService.info(
          'Retry Complete',
          `Retried ${res.retriedCount} notifications. Successful: ${res.succeeded || 0}.`
        );
        this.fetchNotifications();
      },
      error: () => {
        this.isRetryingDeliveries.set(false);
      },
    });
  }

  getIconForCategory(category: string): string {
    switch (category) {
      case 'booking':
        return 'fa-solid fa-ticket text-[#5f4299] bg-purple-50 dark:bg-purple-950/40';
      case 'trip':
        return 'fa-solid fa-bus text-blue-600 bg-blue-50 dark:bg-blue-950/40';
      case 'community':
        return 'fa-solid fa-comments text-rose-500 bg-rose-50 dark:bg-rose-950/40';
      case 'payment':
        return 'fa-solid fa-credit-card text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40';
      case 'promo':
        return 'fa-solid fa-tag text-amber-500 bg-amber-50 dark:bg-amber-950/40';
      default:
        return 'fa-solid fa-bell text-gray-600 bg-gray-50 dark:bg-slate-800';
    }
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/20';
      case 'sent':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-500/20';
      case 'pending':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-500/20';
      case 'failed':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-500/20';
      default:
        return 'bg-gray-100 dark:bg-slate-800 text-gray-500 border border-gray-200 dark:border-slate-700';
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
