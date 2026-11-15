import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

export interface AppNotification {
  _id: string;
  recipientId: string;
  recipientEmail: string;
  title: string;
  message: string;
  category: 'booking' | 'community' | 'payment' | 'trip' | 'promo' | 'system';
  actionUrl?: string;
  read: boolean;
  channel: 'in_app' | 'email' | 'push';
  channels?: ('in_app' | 'email' | 'push')[];
  deliveryStatus: 'sent' | 'delivered' | 'failed' | 'pending';
  deliveryAttempts?: number;
  failureReason?: string;
  language?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: AppNotification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationPreference {
  customerId: string;
  email: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  bookingUpdates: boolean;
  journeyReminders: boolean;
  scheduleChanges: boolean;
  communityInteractions: boolean;
  promotionalOffers: boolean;
  preferredLanguage: 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml';
  preferredTheme?: 'light' | 'dark';
  pushSubscription?: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly baseUrl = `${environment.apiUrl}/notifications`;
  private readonly seenToastIds = new Set<string>();

  readonly unreadCount = signal<number>(0);
  readonly pushPermission = signal<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );

  getNotifications(options: {
    customerId?: string;
    email?: string;
    category?: string;
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
  }): Observable<NotificationResponse> {
    let params = new HttpParams();
    if (options.customerId) params = params.set('customerId', options.customerId);
    if (options.email) params = params.set('email', options.email);
    if (options.category && options.category !== 'all') params = params.set('category', options.category);
    if (options.unreadOnly) params = params.set('unreadOnly', 'true');
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());

    return this.http.get<NotificationResponse>(this.baseUrl, { params }).pipe(
      tap((res) => {
        this.unreadCount.set(res.unreadCount);
        // Show in-app toast for new unread notifications
        for (const notif of res.notifications || []) {
          if (!notif.read && !this.seenToastIds.has(notif._id)) {
            this.seenToastIds.add(notif._id);
            this.toastService.show({
              id: notif._id,
              title: notif.title,
              message: notif.message,
              category: notif.category,
              actionUrl: notif.actionUrl,
              actionLabel: 'View details',
            });

            // If browser push permission is granted, also pop native OS notification!
            this.dispatchNativeBrowserNotification(notif.title, notif.message);
          }
        }
      })
    );
  }

  markAsRead(id: string): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.baseUrl}/${id}/read`, {}).pipe(
      tap(() => {
        if (this.unreadCount() > 0) {
          this.unreadCount.set(this.unreadCount() - 1);
        }
      })
    );
  }

  markAllAsRead(customerId?: string, email?: string): Observable<{ message: string; modifiedCount: number }> {
    return this.http.patch<{ message: string; modifiedCount: number }>(`${this.baseUrl}/read-all`, {
      customerId,
      email,
    }).pipe(
      tap(() => {
        this.unreadCount.set(0);
      })
    );
  }

  deleteNotification(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.baseUrl}/${id}`);
  }

  getPreferences(customerId?: string, email?: string): Observable<NotificationPreference> {
    let params = new HttpParams();
    if (customerId) params = params.set('customerId', customerId);
    if (email) params = params.set('email', email);
    return this.http.get<NotificationPreference>(`${this.baseUrl}/preferences`, { params });
  }

  updatePreferences(prefs: NotificationPreference): Observable<NotificationPreference> {
    return this.http.put<NotificationPreference>(`${this.baseUrl}/preferences`, prefs);
  }

  sendTestNotification(customerId?: string, email?: string, channel: string = 'all'): Observable<{ success: boolean; notification: AppNotification }> {
    return this.http.post<{ success: boolean; notification: AppNotification }>(`${this.baseUrl}/test-channel`, {
      customerId,
      email,
      channel,
    });
  }

  triggerUpcomingReminders(): Observable<{ scanned: number; remindersSent: number }> {
    return this.http.post<{ scanned: number; remindersSent: number }>(`${this.baseUrl}/trigger-reminders`, {});
  }

  retryFailedDeliveries(): Observable<{ retriedCount: number; succeeded?: number }> {
    return this.http.post<{ retriedCount: number; succeeded?: number }>(`${this.baseUrl}/retry-failed`, {});
  }

  /**
   * Requests browser Web Push notification permission.
   */
  async requestPushPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.pushPermission.set(permission);
      if (permission === 'granted') {
        this.dispatchNativeBrowserNotification(
          'Push Notifications Active! 🔔',
          'You will receive instant alerts for booking updates and journey reminders.'
        );
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Could not request notification permission:', err);
      return false;
    }
  }

  /**
   * Pops an OS-level browser push notification when permitted.
   */
  dispatchNativeBrowserNotification(title: string, body: string): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Failed to dispatch native notification:', e);
      }
    }
  }
}
