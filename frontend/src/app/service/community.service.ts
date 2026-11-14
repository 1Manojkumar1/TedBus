import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PostAuthor {
  customerId: string;
  name: string;
  email: string;
  picture?: string;
  badge?: string;
}

export interface RouteTag {
  from: string;
  to: string;
}

export interface CommunityPost {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  images: string[];
  routeTag?: RouteTag;
  author: PostAuthor;
  likes: string[];
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  status: 'published' | 'hidden' | 'deleted';
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostComment {
  _id: string;
  postId: string;
  parentCommentId: string | null;
  author: PostAuthor;
  content: string;
  likes: string[];
  likesCount: number;
  replies?: PostComment[];
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  posts: CommunityPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostDetailResponse {
  post: CommunityPost;
  comments: PostComment[];
}

export interface UserCommunityStats {
  postCount: number;
  commentCount: number;
  totalLikesReceived: number;
  badge: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/community`;

  getPosts(options?: {
    category?: string;
    search?: string;
    tag?: string;
    authorId?: string;
    sort?: 'recent' | 'trending' | 'top';
    page?: number;
    limit?: number;
  }): Observable<PostsResponse> {
    let params = new HttpParams();
    if (options?.category && options.category !== 'All') {
      params = params.set('category', options.category);
    }
    if (options?.search) {
      params = params.set('search', options.search);
    }
    if (options?.tag) {
      params = params.set('tag', options.tag);
    }
    if (options?.authorId) {
      params = params.set('authorId', options.authorId);
    }
    if (options?.sort) {
      params = params.set('sort', options.sort);
    }
    if (options?.page) {
      params = params.set('page', options.page.toString());
    }
    if (options?.limit) {
      params = params.set('limit', options.limit.toString());
    }

    return this.http.get<PostsResponse>(`${this.baseUrl}/posts`, { params });
  }

  getPost(id: string): Observable<PostDetailResponse> {
    return this.http.get<PostDetailResponse>(`${this.baseUrl}/posts/${id}`);
  }

  createPost(data: {
    title: string;
    content: string;
    category: string;
    tags?: string[];
    images?: string[];
    routeTag?: RouteTag;
    author: PostAuthor;
  }): Observable<CommunityPost> {
    return this.http.post<CommunityPost>(`${this.baseUrl}/posts`, data);
  }

  updatePost(
    id: string,
    data: {
      title?: string;
      content?: string;
      category?: string;
      tags?: string[];
      images?: string[];
      routeTag?: RouteTag;
      author?: { customerId: string };
    }
  ): Observable<CommunityPost> {
    return this.http.put<CommunityPost>(`${this.baseUrl}/posts/${id}`, data);
  }

  deletePost(id: string, customerId: string, email?: string): Observable<{ message: string; id: string }> {
    let params = new HttpParams().set('customerId', customerId);
    if (email) {
      params = params.set('email', email);
    }
    return this.http.delete<{ message: string; id: string }>(`${this.baseUrl}/posts/${id}`, { params });
  }

  toggleLikePost(id: string, userId: string): Observable<{ liked: boolean; likesCount: number; likes: string[] }> {
    return this.http.post<{ liked: boolean; likesCount: number; likes: string[] }>(`${this.baseUrl}/posts/${id}/like`, { userId });
  }

  addComment(
    postId: string,
    data: {
      content: string;
      parentCommentId?: string | null;
      author: PostAuthor;
    }
  ): Observable<PostComment> {
    return this.http.post<PostComment>(`${this.baseUrl}/posts/${postId}/comments`, data);
  }

  toggleLikeComment(id: string, userId: string): Observable<{ liked: boolean; likesCount: number; likes: string[] }> {
    return this.http.post<{ liked: boolean; likesCount: number; likes: string[] }>(`${this.baseUrl}/comments/${id}/like`, { userId });
  }

  deleteComment(id: string, customerId: string): Observable<{ message: string; id: string }> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.delete<{ message: string; id: string }>(`${this.baseUrl}/comments/${id}`, { params });
  }

  reportContent(data: {
    contentType: 'post' | 'comment';
    contentId: string;
    reason: string;
    details?: string;
    reportedBy?: { customerId: string; email: string; name: string };
  }): Observable<{ message: string; reportId: string }> {
    return this.http.post<{ message: string; reportId: string }>(`${this.baseUrl}/report`, data);
  }

  getUserStats(customerId: string, email?: string): Observable<UserCommunityStats> {
    let params = new HttpParams();
    if (email) {
      params = params.set('email', email);
    }
    return this.http.get<UserCommunityStats>(`${this.baseUrl}/user-stats/${customerId}`, { params });
  }
}
