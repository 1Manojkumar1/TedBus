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
  deliveryStatus: 'sent' | 'delivered' | 'failed' | 'pending';
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
  communityInteractions: boolean;
  promotionalOffers: boolean;
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
}
