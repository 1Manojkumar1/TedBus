import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../service/auth.service';
import { TranslationService } from '../../service/translation.service';
import { TranslatePipe } from '../../service/translate.pipe';

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

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly auth = inject(AuthService);
  readonly i18n = inject(TranslationService);

  private readonly baseUrl = `${environment.apiUrl}/admin`;

  stats = signal<AdminStats>({
    totalBookings: 0,
    totalPosts: 0,
    totalReviews: 0,
    pendingReports: 0,
    totalCustomers: 0,
  });

  reports = signal<ContentReportItem[]>([]);
  isLoading = signal<boolean>(false);
  selectedStatus = signal<string>('pending');

  ngOnInit(): void {
    this.fetchStats();
    this.fetchReports();
  }

  fetchStats(): void {
    this.http.get<AdminStats>(`${this.baseUrl}/stats`).subscribe({
      next: (s) => this.stats.set(s),
      error: () => {},
    });
  }

  fetchReports(): void {
    this.isLoading.set(true);
    this.http
      .get<{ reports: ContentReportItem[] }>(
        `${this.baseUrl}/reports?status=${this.selectedStatus()}`
      )
      .subscribe({
        next: (res) => {
          this.reports.set(res.reports);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to fetch reports:', err);
          this.isLoading.set(false);
        },
      });
  }

  filterStatus(status: string): void {
    this.selectedStatus.set(status);
    this.fetchReports();
  }

  resolveReport(report: ContentReportItem, action: 'hide' | 'delete' | 'dismiss'): void {
    this.http
      .patch<ContentReportItem>(`${this.baseUrl}/reports/${report._id}`, { action })
      .subscribe({
        next: (updated) => {
          report.status = updated.status;
          report.actionTaken = updated.actionTaken;
          this.reports.set([...this.reports()]);
          this.fetchStats();
        },
        error: (err) => {
          console.error('Failed to resolve report:', err);
          alert('Failed to resolve report.');
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
