const fs = require('fs');

let content = fs.readFileSync('frontend/src/app/Component/community/community.component.html', 'utf8');

// 1. Single post view header count
content = content.replace(
  '<span>{{ activeComments().length }} Comments</span>',
  '<span>{{ getTotalCommentsCount(singlePost()) }} Comments</span>'
);

// 2. Single post view Discussion thread count
content = content.replace(
  '<span>Discussion Thread ({{ activeComments().length }})</span>',
  '<span>Discussion Thread ({{ getTotalCommentsCount(singlePost()) }})</span>'
);

// 3. Modal comments count
content = content.replace(
  '<span>{{ activePost()?.commentsCount || 0 }} Comments</span>',
  '<span>{{ getTotalCommentsCount(activePost()) }} Comments</span>'
);

content = content.replace(
  '<h4 class="font-bold text-sm">Discussions ({{ activeComments().length }})</h4>',
  '<h4 class="font-bold text-sm">Discussions ({{ getTotalCommentsCount(activePost()) }})</h4>'
);

// 4. In single post view, enhance comment item with Reply action and Nested Replies
const singleCommentTarget = `                  <div class="flex items-center gap-3 pt-1 text-[11px] text-gray-500">
                    <button (click)="toggleCommentLike(comment)"
                      class="flex items-center gap-1 hover:text-red-500"
                      [class.text-red-500]="isCommentLikedByUser(comment)">
                      <i [class]="isCommentLikedByUser(comment) ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart'"></i>
                      <span>{{ comment.likesCount || 0 }}</span>
                    </button>
                  </div>`.replace(/\r?\n/g, '\r\n');

const singleCommentReplacement = `                  <div class="flex items-center gap-3 pt-1 text-[11px] text-gray-500">
                    <button (click)="toggleCommentLike(comment)"
                      class="flex items-center gap-1 hover:text-red-500"
                      [class.text-red-500]="isCommentLikedByUser(comment)">
                      <i [class]="isCommentLikedByUser(comment) ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart'"></i>
                      <span>{{ comment.likesCount || 0 }}</span>
                    </button>
                    <button (click)="replyingToCommentId.set(replyingToCommentId() === comment._id ? null : comment._id)" class="font-semibold text-[#5f4299] hover:underline">
                      Reply
                    </button>
                  </div>

                  <!-- Nested Replies in Single Post View -->
                  <div *ngIf="comment.replies && comment.replies.length > 0" class="ml-4 pl-3 border-l-2 border-purple-200 dark:border-slate-700 space-y-2 mt-2 pt-1">
                    <div *ngFor="let rep of comment.replies" class="p-3 rounded-lg bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 space-y-1">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-1.5">
                          <span class="font-bold text-gray-800 dark:text-gray-100">{{ rep.author.name }}</span>
                          <span *ngIf="rep.author.badge" [class]="'text-[9px] font-bold px-1.5 py-0.2 rounded-full border ' + getBadgeColor(rep.author.badge)">
                            {{ rep.author.badge }}
                          </span>
                          <span class="text-[9px] text-gray-400">• {{ formatDate(rep.createdAt) }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <button (click)="openReportModal('comment', rep._id)" class="text-gray-400 hover:text-amber-500" title="Report">
                            <i class="fa-regular fa-flag text-[10px]"></i>
                          </button>
                          <button *ngIf="auth.user()?.email === rep.author.email" (click)="deleteComment(rep._id)" class="text-gray-400 hover:text-red-500" title="Delete">
                            <i class="fa-solid fa-trash text-[10px]"></i>
                          </button>
                        </div>
                      </div>
                      <p class="text-gray-700 dark:text-gray-300">{{ rep.content }}</p>
                    </div>
                  </div>

                  <!-- Inline Reply Input in Single Post View -->
                  <div *ngIf="replyingToCommentId() === comment._id" class="mt-2 ml-4 p-3 bg-purple-50/50 dark:bg-slate-900/60 rounded-xl space-y-2 border border-purple-100 dark:border-slate-700">
                    <div *ngIf="!auth.isloggedin()" class="text-[11px] text-purple-700 dark:text-purple-300">
                      Please sign in to reply to {{ comment.author.name }}.
                    </div>
                    <div *ngIf="auth.isloggedin()" class="space-y-2">
                      <input [(ngModel)]="replyText" type="text" [placeholder]="'Reply to ' + comment.author.name + '...'"
                        class="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-[#5f4299]" />
                      <div class="flex justify-end gap-2">
                        <button (click)="replyingToCommentId.set(null)" class="px-2.5 py-1 text-gray-500 hover:text-gray-700 text-xs">
                          Cancel
                        </button>
                        <button (click)="addComment(comment._id)" [disabled]="!replyText().trim()"
                          class="px-3 py-1 bg-[#5f4299] text-white text-xs font-bold rounded-lg hover:bg-[#4b337e] disabled:opacity-40">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>`.replace(/\r?\n/g, '\r\n');

content = content.replace(singleCommentTarget, singleCommentReplacement);

// 5. In card, format comments count cleanly
const cardCommentTarget = `                  <span *ngIf="post.commentsCount > 0" class="flex items-center gap-1">
                    <span>•</span>
                    <i class="fa-regular fa-comment text-[10px]"></i>
                    <span>{{ post.commentsCount }}</span>
                  </span>`.replace(/\r?\n/g, '\r\n');

const cardCommentReplacement = `                  <span class="flex items-center gap-1">
                    <span>•</span>
                    <i class="fa-regular fa-comment text-[10px]"></i>
                    <span>{{ post.commentsCount || 0 }} {{ (post.commentsCount || 0) === 1 ? 'comment' : 'comments' }}</span>
                  </span>`.replace(/\r?\n/g, '\r\n');

content = content.replace(cardCommentTarget, cardCommentReplacement);

fs.writeFileSync('frontend/src/app/Component/community/community.component.html', content, 'utf8');
console.log('Successfully updated community.component.html!');
