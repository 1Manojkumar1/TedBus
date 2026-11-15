import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../service/auth.service';
import { TranslationService } from '../../service/translation.service';
import { ToastService } from '../../service/toast.service';
import { ConfirmDialogService } from '../../service/confirm-dialog.service';

export interface AdminStats {
  totalBookings: number;
  totalPosts: number;
  totalReviews: number;
  pendingReports: number;
  totalCustomers: number;
}

export interface ContentReportItem {
  _id: string;
  contentType: 'post' | 'comment';
  contentId: string;
  reportedBy: { customerId: string; email: string; name: string };
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  actionTaken?: string;
  contentSnippet?: string;
  contentAuthor?: string;
  createdAt: string;
}

export interface AdminPostItem {
  _id: string;
  title: string;
  content: string;
  category: string;
  status: 'published' | 'hidden' | 'deleted';
  author: { name: string; email: string; picture?: string; badge?: string };
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  routeTag?: { from?: string; to?: string };
  createdAt: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly i18n = inject(TranslationService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  private readonly baseUrl = `${environment.apiUrl}/admin`;

  activeTab = signal<'reports' | 'posts' | 'notifications'>('reports');

  // Promo Broadcast form
  promoForm = {
    code: 'FESTIVE25',
    discount: '25% OFF',
    title: 'Weekend Travel Sale! 🎟️',
    message: 'Save 25% on your next bus journey across 180+ verified routes with code FESTIVE25. Book now!',
  };
  isBroadcasting = signal<boolean>(false);

  // Schedule Change form
  scheduleForm = {
    busId: '6af866feb003c84a41eae28a',
    date: new Date().toISOString().split('T')[0],
    oldTime: '21:00',
    newTime: '21:30',
    operatorName: 'TedBus Primo Express',
  };
  isSendingScheduleAlert = signal<boolean>(false);

  isScanningReminders = signal<boolean>(false);
  isRetryingDeliveries = signal<boolean>(false);

  stats = signal<AdminStats>({
    totalBookings: 0,
    totalPosts: 0,
    totalReviews: 0,
    pendingReports: 0,
    totalCustomers: 0,
  });

  // Reports
  reports = signal<ContentReportItem[]>([]);
  isLoadingReports = signal<boolean>(false);
  selectedReportStatus = signal<string>('pending');

  // Posts Moderation
  posts = signal<AdminPostItem[]>([]);
  isLoadingPosts = signal<boolean>(false);
  postStatusFilter = signal<string>('all');
  postCategoryFilter = signal<string>('all');
  postSearchQuery = signal<string>('');

  categories: string[] = [
    'all',
    'Bus Routes',
    'Destinations',
    'Travel Experiences',
    'Travel Tips',
    'Safety & Recommendations',
    'General Discussions',
  ];

  ngOnInit(): void {
    this.fetchStats();
    this.fetchReports();
    this.fetchPosts();
  }

  fetchStats(): void {
    this.http.get<AdminStats>(`${this.baseUrl}/stats`).subscribe({
      next: (s) => this.stats.set(s),
      error: () => {},
    });
  }

  fetchReports(): void {
    this.isLoadingReports.set(true);
    this.http
      .get<{ reports: ContentReportItem[] }>(
        `${this.baseUrl}/reports?status=${this.selectedReportStatus()}`
      )
      .subscribe({
        next: (res) => {
          this.reports.set(res.reports || []);
          this.isLoadingReports.set(false);
        },
        error: (err) => {
          console.error('Failed to fetch reports:', err);
          this.isLoadingReports.set(false);
        },
      });
  }

  filterReportStatus(status: string): void {
    this.selectedReportStatus.set(status);
    this.fetchReports();
  }

  async resolveReport(report: ContentReportItem, action: 'hide' | 'delete' | 'dismiss' | 'restore'): Promise<void> {
    if (action === 'delete') {
      const confirmed = await this.confirmDialogService.confirm({
        title: 'Delete Flagged Content',
        message: 'Are you sure you want to permanently remove this content? This action cannot be undone.',
        confirmText: 'Delete Permanently',
        cancelText: 'Cancel',
        type: 'danger',
        icon: 'fa-solid fa-trash',
      });
      if (!confirmed) return;
    }

    this.http
      .patch<ContentReportItem>(`${this.baseUrl}/reports/${report._id}`, { action })
      .subscribe({
        next: (updated) => {
          report.status = updated.status;
          report.actionTaken = updated.actionTaken;
          this.reports.set([...this.reports()]);
          this.fetchStats();
          this.fetchPosts();

          const messageMap = {
            hide: 'Content has been hidden from the community feed.',
            delete: 'Content has been permanently deleted.',
            dismiss: 'Report dismissed as non-violating.',
            restore: 'Content has been restored and republished.',
          };
          this.toastService.success('Moderation Updated', messageMap[action]);
        },
        error: (err) => {
          console.error('Failed to resolve report:', err);
          this.toastService.error('Report Action Failed', 'Could not update report status. Please try again.');
        },
      });
  }

  fetchPosts(): void {
    this.isLoadingPosts.set(true);
    const params: string[] = [];
    if (this.postStatusFilter() !== 'all') params.push(`status=${encodeURIComponent(this.postStatusFilter())}`);
    if (this.postCategoryFilter() !== 'all') params.push(`category=${encodeURIComponent(this.postCategoryFilter())}`);
    if (this.postSearchQuery().trim()) params.push(`search=${encodeURIComponent(this.postSearchQuery().trim())}`);

    const qs = params.length > 0 ? `?${params.join('&')}` : '';

    this.http.get<{ posts: AdminPostItem[] }>(`${this.baseUrl}/posts${qs}`).subscribe({
      next: (res) => {
        this.posts.set(res.posts || []);
        this.isLoadingPosts.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch posts:', err);
        this.isLoadingPosts.set(false);
      },
    });
  }

  async moderatePostDirectly(post: AdminPostItem, status: 'published' | 'hidden' | 'deleted'): Promise<void> {
    if (status === 'deleted') {
      const confirmed = await this.confirmDialogService.confirm({
        title: 'Delete Community Story',
        message: `Are you sure you want to delete "${post.title}"? This cannot be undone.`,
        confirmText: 'Delete Post',
        cancelText: 'Cancel',
        type: 'danger',
        icon: 'fa-solid fa-trash',
      });
      if (!confirmed) return;
    }

    this.http
      .patch<AdminPostItem>(`${this.baseUrl}/posts/${post._id}/status`, { status })
      .subscribe({
        next: (updated) => {
          post.status = updated.status;
          this.posts.set([...this.posts()]);
          this.fetchStats();

          const toastTitle =
            status === 'published'
              ? 'Post Restored'
              : status === 'hidden'
              ? 'Post Hidden'
              : 'Post Deleted';

          const toastDesc =
            status === 'published'
              ? 'Post is now visible to all travelers in the community.'
              : status === 'hidden'
              ? 'Post is now hidden from traveler feeds.'
              : 'Post has been marked as deleted.';

          this.toastService.success(toastTitle, toastDesc);
        },
        error: (err) => {
          console.error('Failed to moderate post:', err);
          this.toastService.error('Moderation Error', 'Could not update post visibility.');
        },
      });
  }

  viewInCommunity(post: AdminPostItem): void {
    this.router.navigate(['/community']);
  }

  broadcastPromo(): void {
    if (!this.promoForm.code.trim()) {
      this.toastService.warning('Validation', 'Promo coupon code is required.');
      return;
    }

    this.isBroadcasting.set(true);
    this.http.post<{ success: boolean; recipientsCount: number }>(`${environment.apiUrl}/notifications/broadcast-promo`, this.promoForm).subscribe({
      next: (res) => {
        this.isBroadcasting.set(false);
        this.toastService.success('Promotional Campaign Dispatched', `Broadcast sent to ${res.recipientsCount} opted-in travelers in their chosen language.`);
      },
      error: (err) => {
        this.isBroadcasting.set(false);
        this.toastService.error('Broadcast Error', 'Could not dispatch promo notifications.');
      },
    });
  }

  notifyScheduleChange(): void {
    if (!this.scheduleForm.busId.trim() || !this.scheduleForm.newTime.trim()) {
      this.toastService.warning('Validation', 'Bus ID and updated departure time are required.');
      return;
    }

    this.isSendingScheduleAlert.set(true);
    this.http.post<{ success: boolean; notifiedCount: number }>(`${environment.apiUrl}/notifications/schedule-change`, this.scheduleForm).subscribe({
      next: (res) => {
        this.isSendingScheduleAlert.set(false);
        this.toastService.success('Schedule Alerts Sent', `Notified ${res.notifiedCount} booked passengers with updated schedule details.`);
      },
      error: (err) => {
        this.isSendingScheduleAlert.set(false);
        this.toastService.error('Alert Error', 'Could not send schedule change alerts.');
      },
    });
  }

  triggerJourneyReminders(): void {
    this.isScanningReminders.set(true);
    this.http.post<{ scanned: number; remindersSent: number }>(`${environment.apiUrl}/notifications/trigger-reminders`, {}).subscribe({
      next: (res) => {
        this.isScanningReminders.set(false);
        this.toastService.info('Scanner Complete', `Scanned ${res.scanned} active journeys. Dispatched ${res.remindersSent} reminders.`);
      },
      error: () => {
        this.isScanningReminders.set(false);
      },
    });
  }

  retryFailedDeliveries(): void {
    this.isRetryingDeliveries.set(true);
    this.http.post<{ retriedCount: number; succeeded?: number }>(`${environment.apiUrl}/notifications/retry-failed`, {}).subscribe({
      next: (res) => {
        this.isRetryingDeliveries.set(false);
        this.toastService.info('Retry Complete', `Retried ${res.retriedCount} notifications. Successful: ${res.succeeded || 0}.`);
      },
      error: () => {
        this.isRetryingDeliveries.set(false);
      },
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
