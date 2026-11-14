const fs = require('fs');

let content = fs.readFileSync('frontend/src/app/Component/community/community.component.ts', 'utf8');

// 1. Add getTotalCommentsCount
const target1 = `  closePostDetail(): void {
    this.activePost.set(null);
    this.activeComments.set([]);
    this.replyingToCommentId.set(null);
  }`.replace(/\r?\n/g, '\r\n');

const replacement1 = `  closePostDetail(): void {
    this.activePost.set(null);
    this.activeComments.set([]);
    this.replyingToCommentId.set(null);
  }

  getTotalCommentsCount(post?: CommunityPost | null): number {
    if (this.activeComments() && this.activeComments().length > 0) {
      let count = 0;
      for (const c of this.activeComments()) {
        count += 1 + (c.replies ? c.replies.length : 0);
      }
      return count;
    }
    return post?.commentsCount || 0;
  }`.replace(/\r?\n/g, '\r\n');

content = content.replace(target1, replacement1);

// 2. In addComment, keep singlePost synced
const target2 = `          current.commentsCount = (current.commentsCount || 0) + 1;
          this.activePost.set({ ...current });
          this.posts.set([...this.posts()]);`.replace(/\r?\n/g, '\r\n');

const replacement2 = `          current.commentsCount = (current.commentsCount || 0) + 1;
          this.activePost.set({ ...current });
          this.singlePost.set({ ...current });
          this.posts.update((list) =>
            list.map((p) => (p._id === current._id ? { ...p, commentsCount: current.commentsCount } : p))
          );`.replace(/\r?\n/g, '\r\n');

content = content.replace(target2, replacement2);

// 3. In deleteComment, keep singlePost synced and handle reply deletion
const target3 = `        this.activeComments.set(
          this.activeComments().filter((c) => c._id !== commentId)
        );
        const current = this.activePost();
        if (current && current.commentsCount > 0) {
          current.commentsCount -= 1;
          this.activePost.set({ ...current });
        }`.replace(/\r?\n/g, '\r\n');

const replacement3 = `        // Remove from top-level or from parent's replies
        const updated = this.activeComments()
          .filter((c) => c._id !== commentId)
          .map((c) => ({
            ...c,
            replies: (c.replies || []).filter((r) => r._id !== commentId),
          }));
        this.activeComments.set(updated);
        const current = this.activePost();
        if (current && current.commentsCount > 0) {
          current.commentsCount -= 1;
          this.activePost.set({ ...current });
          this.singlePost.set({ ...current });
          this.posts.update((list) =>
            list.map((p) => (p._id === current._id ? { ...p, commentsCount: current.commentsCount } : p))
          );
        }`.replace(/\r?\n/g, '\r\n');

content = content.replace(target3, replacement3);

fs.writeFileSync('frontend/src/app/Component/community/community.component.ts', content, 'utf8');
console.log('Successfully updated community.component.ts!');
