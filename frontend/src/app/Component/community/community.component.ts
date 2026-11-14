import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CommunityService,
  CommunityPost,
  PostComment,
  UserCommunityStats,
} from '../../service/community.service';
import { AuthService } from '../../service/auth.service';
import { TranslationService } from '../../service/translation.service';
import { ToastService } from '../../service/toast.service';
import { ConfirmDialogService } from '../../service/confirm-dialog.service';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css'],
})
export class CommunityComponent implements OnInit {
  private readonly communityService = inject(CommunityService);
  readonly auth = inject(AuthService);
  readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly categories = [
    'All',
    'Bus routes',
    'Destinations',
    'Travel experiences',
    'Travel tips',
    'Safety and recommendations',
    'General discussions',
  ];

  selectedCategory = signal<string>('All');
  searchQuery = signal<string>('');
  currentSort = signal<'recent' | 'trending' | 'top'>('recent');

  posts = signal<CommunityPost[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Pagination
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalPosts = signal<number>(0);

  // User Stats
  userStats = signal<UserCommunityStats | null>(null);

  // Create / Edit Post Modal
  isCreateModalOpen = signal<boolean>(false);
  isSubmittingPost = signal<boolean>(false);
  editingPostId = signal<string | null>(null);

  postForm = {
    title: '',
    content: '',
    category: 'Travel experiences',
    routeFrom: '',
    routeTo: '',
    imageUrl: '',
    tagsString: '',
  };

  // Selected Post for Detail View / Comments
  activePost = signal<CommunityPost | null>(null);
  activeComments = signal<PostComment[]>([]);
  isLoadingComments = signal<boolean>(false);
  newCommentText = signal<string>('');
  replyingToCommentId = signal<string | null>(null);
  replyText = signal<string>('');

  // Share Dialog
  isShareModalOpen = signal<boolean>(false);
  sharingPost = signal<CommunityPost | null>(null);
  copySuccess = signal<boolean>(false);

  // Report Dialog
  isReportModalOpen = signal<boolean>(false);
  reportingTarget = signal<{ type: 'post' | 'comment'; id: string } | null>(null);
  reportReason = signal<string>('spam');
  reportDetails = signal<string>('');
  reportSubmitted = signal<boolean>(false);

  ngOnInit(): void {
    this.fetchPosts();
    if (this.auth.isloggedin()) {
      this.fetchUserStats();
    }
  }

  fetchPosts(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.communityService
      .getPosts({
        category: this.selectedCategory(),
        search: this.searchQuery(),
        sort: this.currentSort(),
        page: this.currentPage(),
        limit: 10,
      })
      .subscribe({
        next: (res) => {
          this.posts.set(res.posts);
          this.totalPages.set(res.pagination.totalPages);
          this.totalPosts.set(res.pagination.total);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error fetching posts:', err);
          this.errorMessage.set('Failed to load community discussions. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  fetchUserStats(): void {
    const user = this.auth.user();
    const customerId = user?._id || user?.googleId || user?.email;
    if (!customerId) return;

    this.communityService.getUserStats(customerId, user?.email).subscribe({
      next: (stats) => this.userStats.set(stats),
      error: () => {},
    });
  }

  onCategorySelect(cat: string): void {
    this.selectedCategory.set(cat);
    this.currentPage.set(1);
    this.fetchPosts();
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.fetchPosts();
  }

  onSortChange(sort: 'recent' | 'trending' | 'top'): void {
    this.currentSort.set(sort);
    this.currentPage.set(1);
    this.fetchPosts();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.fetchPosts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Like / Unlike Post
  toggleLike(post: CommunityPost, event?: MouseEvent): void {
    event?.stopPropagation();
    const user = this.auth.user();
    if (!this.auth.isloggedin() || !user) {
      this.toastService.warning('Sign In Required', 'Please sign in to like posts and engage with the community!');
      return;
    }

    const userId = user._id || user.googleId || user.email;
    this.communityService.toggleLikePost(post._id, userId).subscribe({
      next: (res) => {
        post.likes = res.likes;
        post.likesCount = res.likesCount;
        this.posts.set([...this.posts()]);
        if (this.activePost()?._id === post._id) {
          this.activePost.set({ ...post });
        }
      },
      error: (err) => console.error('Failed to like post:', err),
    });
  }

  isLikedByUser(post: CommunityPost): boolean {
    const user = this.auth.user();
    if (!user) return false;
    const userId = user._id || user.googleId || user.email;
    return post.likes?.includes(userId) ?? false;
  }

  isCommentLikedByUser(comment: PostComment): boolean {
    const user = this.auth.user();
    if (!user) return false;
    const userId = user._id || user.googleId || user.email;
    return comment.likes?.includes(userId) ?? false;
  }

  // Post Detail & Comments
  openPostDetail(post: CommunityPost): void {
    this.activePost.set(post);
    this.isLoadingComments.set(true);
    this.communityService.getPost(post._id).subscribe({
      next: (res) => {
        this.activePost.set(res.post);
        this.activeComments.set(res.comments);
        this.isLoadingComments.set(false);
      },
      error: (err) => {
        console.error('Failed to get post details:', err);
        this.isLoadingComments.set(false);
      },
    });
  }

  closePostDetail(): void {
    this.activePost.set(null);
    this.activeComments.set([]);
    this.replyingToCommentId.set(null);
  }

  addComment(parentCommentId?: string | null): void {
    const user = this.auth.user();
    if (!this.auth.isloggedin() || !user) {
      this.toastService.warning('Sign In Required', 'Please sign in to comment.');
      return;
    }

    const text = parentCommentId ? this.replyText() : this.newCommentText();
    if (!text.trim()) return;

    const current = this.activePost();
    if (!current) return;

    const author = {
      customerId: user._id || user.googleId || user.email,
      name: user.name || 'Traveler',
      email: user.email,
      picture: user.picture || '',
    };

    this.communityService
      .addComment(current._id, {
        content: text.trim(),
        parentCommentId: parentCommentId || null,
        author,
      })
      .subscribe({
        next: (comment) => {
          if (parentCommentId) {
            const parent = this.activeComments().find((c) => c._id === parentCommentId);
            if (parent) {
              parent.replies = parent.replies || [];
              parent.replies.push(comment);
            }
            this.replyText.set('');
            this.replyingToCommentId.set(null);
          } else {
            this.activeComments.set([...this.activeComments(), comment]);
            this.newCommentText.set('');
          }
          current.commentsCount = (current.commentsCount || 0) + 1;
          this.activePost.set({ ...current });
          this.posts.set([...this.posts()]);
        },
        error: (err) => console.error('Failed to add comment:', err),
      });
  }

  toggleCommentLike(comment: PostComment): void {
    const user = this.auth.user();
    if (!this.auth.isloggedin() || !user) {
      this.toastService.warning('Sign In Required', 'Please sign in to like comments.');
      return;
    }

    const userId = user._id || user.googleId || user.email;
    this.communityService.toggleLikeComment(comment._id, userId).subscribe({
      next: (res) => {
        comment.likes = res.likes;
        comment.likesCount = res.likesCount;
        this.activeComments.set([...this.activeComments()]);
      },
      error: (err) => console.error('Failed to like comment:', err),
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Comment',
      message: 'Are you sure you want to permanently delete this comment?',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'fa-solid fa-trash',
    });

    if (!confirmed) return;

    const user = this.auth.user();
    const customerId = user?._id || user?.googleId || user?.email;
    if (!customerId) return;

    this.communityService.deleteComment(commentId, customerId).subscribe({
      next: () => {
        this.activeComments.set(
          this.activeComments().filter((c) => c._id !== commentId)
        );
        const current = this.activePost();
        if (current && current.commentsCount > 0) {
          current.commentsCount -= 1;
          this.activePost.set({ ...current });
        }
        this.toastService.info('Comment Deleted', 'Your comment was removed.');
      },
      error: (err) => {
        console.error('Failed to delete comment:', err);
        this.toastService.error('Delete Failed', 'Failed to remove comment.');
      },
    });
  }

  // Create / Edit Post
  openCreateModal(): void {
    if (!this.auth.isloggedin()) {
      this.toastService.warning('Sign In Required', 'Please sign in to create a travel post!');
      return;
    }
    this.editingPostId.set(null);
    this.postForm = {
      title: '',
      content: '',
      category: 'Travel experiences',
      routeFrom: '',
      routeTo: '',
      imageUrl: '',
      tagsString: '',
    };
    this.isCreateModalOpen.set(true);
  }

  openEditModal(post: CommunityPost, event?: MouseEvent): void {
    event?.stopPropagation();
    this.editingPostId.set(post._id);
    this.postForm = {
      title: post.title,
      content: post.content,
      category: post.category,
      routeFrom: post.routeTag?.from || '',
      routeTo: post.routeTag?.to || '',
      imageUrl: post.images?.[0] || '',
      tagsString: post.tags?.join(', ') || '',
    };
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
    this.editingPostId.set(null);
  }

  submitPost(): void {
    if (!this.postForm.title.trim() || !this.postForm.content.trim()) {
      this.toastService.warning('Missing Fields', 'Please enter both a title and content for your post.');
      return;
    }

    const user = this.auth.user();
    if (!user) return;

    this.isSubmittingPost.set(true);

    const tags = this.postForm.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const images = this.postForm.imageUrl.trim() ? [this.postForm.imageUrl.trim()] : [];

    const routeTag =
      this.postForm.routeFrom.trim() && this.postForm.routeTo.trim()
        ? { from: this.postForm.routeFrom.trim(), to: this.postForm.routeTo.trim() }
        : undefined;

    const author = {
      customerId: user._id || user.googleId || user.email,
      name: user.name || 'Traveler',
      email: user.email,
      picture: user.picture || '',
    };

    if (this.editingPostId()) {
      this.communityService
        .updatePost(this.editingPostId()!, {
          title: this.postForm.title,
          content: this.postForm.content,
          category: this.postForm.category,
          tags,
          images,
          routeTag,
          author: { customerId: author.customerId },
        })
        .subscribe({
          next: (updated) => {
            this.isSubmittingPost.set(false);
            this.closeCreateModal();
            this.fetchPosts();
            this.toastService.success('Post Updated! 📝', 'Your edits were saved successfully.');
          },
          error: (err) => {
            console.error('Update post failed:', err);
            this.toastService.error('Update Failed', err?.error?.error || 'Failed to update post.');
            this.isSubmittingPost.set(false);
          },
        });
    } else {
      this.communityService
        .createPost({
          title: this.postForm.title,
          content: this.postForm.content,
          category: this.postForm.category,
          tags,
          images,
          routeTag,
          author,
        })
        .subscribe({
          next: () => {
            this.isSubmittingPost.set(false);
            this.closeCreateModal();
            this.fetchPosts();
            this.fetchUserStats();
            this.toastService.success('Story Published! ✈️', 'Your travel discussion is now live.');
          },
          error: (err) => {
            console.error('Create post failed:', err);
            this.toastService.error('Post Failed', err?.error?.error || 'Failed to create post. Please try again.');
            this.isSubmittingPost.set(false);
          },
        });
    }
  }

  async deletePost(post: CommunityPost, event?: MouseEvent): Promise<void> {
    event?.stopPropagation();

    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Travel Story',
      message: `Are you sure you want to delete "${post.title}"? This cannot be undone.`,
      confirmText: 'Yes, Delete Post',
      cancelText: 'Keep Post',
      type: 'danger',
      icon: 'fa-solid fa-trash',
    });

    if (!confirmed) return;

    const user = this.auth.user();
    const customerId = user?._id || user?.googleId || user?.email;
    if (!customerId) return;

    this.communityService.deletePost(post._id, customerId, user?.email).subscribe({
      next: () => {
        this.posts.set(this.posts().filter((p) => p._id !== post._id));
        if (this.activePost()?._id === post._id) {
          this.closePostDetail();
        }
        this.fetchUserStats();
        this.toastService.info('Post Deleted', 'Your travel discussion was removed.');
      },
      error: (err) => {
        console.error('Delete post error:', err);
        this.toastService.error('Delete Failed', err?.error?.error || 'Failed to delete post.');
      },
    });
  }

  isPostOwner(post: CommunityPost): boolean {
    const user = this.auth.user();
    if (!user) return false;
    const userId = user._id || user.googleId || user.email;
    return post.author?.customerId === userId || post.author?.email === user.email;
  }

  // Route Shortcut: search buses for route tag
  searchBusesForRoute(from: string, to: string, event?: MouseEvent): void {
    event?.stopPropagation();
    const today = new Date().toISOString().split('T')[0];
    this.router.navigate(['/selectbus'], {
      queryParams: { from, to, date: today },
    });
  }

  // Social Share Dialog
  openShareModal(post: CommunityPost, event?: MouseEvent): void {
    event?.stopPropagation();
    this.sharingPost.set(post);
    this.copySuccess.set(false);
    this.isShareModalOpen.set(true);
  }

  closeShareModal(): void {
    this.isShareModalOpen.set(false);
    this.sharingPost.set(null);
  }

  getPostShareUrl(): string {
    const post = this.sharingPost();
    if (!post) return window.location.href;
    return `${window.location.origin}/community?postId=${post._id}`;
  }

  shareOnWhatsApp(): void {
    const post = this.sharingPost();
    if (!post) return;
    const text = encodeURIComponent(
      `Check out this travel post on TedBus: "${post.title}"\n${this.getPostShareUrl()}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  shareOnFacebook(): void {
    const url = encodeURIComponent(this.getPostShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }

  shareOnTwitter(): void {
    const post = this.sharingPost();
    if (!post) return;
    const text = encodeURIComponent(`"${post.title}" on TedBus Travel Community`);
    const url = encodeURIComponent(this.getPostShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.getPostShareUrl()).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2500);
    });
  }

  // Moderation / Report Dialog
  openReportModal(type: 'post' | 'comment', id: string, event?: MouseEvent): void {
    event?.stopPropagation();
    this.reportingTarget.set({ type, id });
    this.reportReason.set('spam');
    this.reportDetails.set('');
    this.reportSubmitted.set(false);
    this.isReportModalOpen.set(true);
  }

  closeReportModal(): void {
    this.isReportModalOpen.set(false);
    this.reportingTarget.set(null);
  }

  submitReport(): void {
    const target = this.reportingTarget();
    if (!target) return;

    const user = this.auth.user();
    const reportedBy = user
      ? { customerId: user._id || user.googleId || user.email, email: user.email, name: user.name || 'User' }
      : undefined;

    this.communityService
      .reportContent({
        contentType: target.type,
        contentId: target.id,
        reason: this.reportReason(),
        details: this.reportDetails(),
        reportedBy,
      })
      .subscribe({
        next: () => {
          this.reportSubmitted.set(true);
          this.toastService.info('Report Submitted', 'Our moderation team will review this content.');
          setTimeout(() => this.closeReportModal(), 1800);
        },
        error: (err) => {
          this.toastService.error('Report Failed', err?.error?.error || 'Failed to submit report.');
        },
      });
  }

  getBadgeColor(badge?: string): string {
    switch (badge) {
      case 'Top Contributor':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700';
      case 'Verified Traveler':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      case 'Route Explorer':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
