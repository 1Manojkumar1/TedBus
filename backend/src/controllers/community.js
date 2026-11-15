import mongoose from 'mongoose';
import { CommunityPost, COMMUNITY_CATEGORIES } from '../models/communityPost.js';
import { PostComment } from '../models/postComment.js';
import { ContentReport } from '../models/contentReport.js';
import { Booking } from '../models/booking.js';
import { Customer } from '../models/customer.js';
import { sendCommunityInteractionNotification } from '../services/notification.js';

/**
 * Computes a user's contributor badge based on booking history and community activity
 */
async function computeUserBadge(customerId, email) {
  try {
    const bookingCount = await Booking.countDocuments({
      $or: [{ customerId }, { email: email?.toLowerCase() }],
    }).exec();

    const postCount = await CommunityPost.countDocuments({
      'author.customerId': customerId,
      status: 'published',
    }).exec();

    if (bookingCount >= 3 && postCount >= 3) {
      return 'Top Contributor';
    }
    if (bookingCount >= 1) {
      return 'Verified Traveler';
    }
    if (postCount >= 2) {
      return 'Route Explorer';
    }
    return 'Community Member';
  } catch {
    return 'Traveler';
  }
}

/**
 * GET /api/community/posts
 */
export async function listPosts(req, res) {
  try {
    const {
      category,
      search,
      tag,
      authorId,
      sort = 'recent',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { status: 'published' };

    if (category && category !== 'All' && COMMUNITY_CATEGORIES.includes(category)) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (authorId || req.query.authorEmail) {
      query.$or = [
        ...(authorId ? [{ 'author.customerId': authorId }] : []),
        ...(req.query.authorEmail ? [{ 'author.email': req.query.authorEmail.toLowerCase() }] : []),
      ];
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { content: { $regex: term, $options: 'i' } },
        { tags: { $regex: term, $options: 'i' } },
      ];
    }

    let sortCriteria = { createdAt: -1 };
    if (sort === 'trending') {
      sortCriteria = { likesCount: -1, commentsCount: -1, createdAt: -1 };
    } else if (sort === 'top') {
      sortCriteria = { likesCount: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      CommunityPost.find(query)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      CommunityPost.countDocuments(query).exec(),
    ]);

    for (const post of posts) {
      if (Array.isArray(post.likes)) {
        post.likesCount = post.likes.length;
      }
    }

    return res.json({
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('listPosts error:', err);
    return res.status(500).json({ error: 'Failed to fetch community posts' });
  }
}

/**
 * GET /api/community/posts/:id
 */
export async function getPost(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const query = mongoose.isValidObjectId(id) ? { _id: id, status: 'published' } : { status: 'published' };
    if (!mongoose.isValidObjectId(id)) {
      // Allow fallback lookup
      query.$or = [{ _id: id }, { title: new RegExp(id.replace(/-/g, ' '), 'i') }];
    }

    // Increment view count asynchronously
    const post = await CommunityPost.findOneAndUpdate(
      query,
      { $inc: { viewsCount: 1 } },
      { new: true }
    )
      .lean()
      .exec();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Fetch comments (top-level and replies) using exact post._id
    const comments = await PostComment.find({
      postId: post._id,
      status: 'published',
    })
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    // Group comments hierarchically
    const topLevel = [];
    const replyMap = new Map();

    for (const comment of comments) {
      if (!comment.parentCommentId) {
        comment.replies = [];
        topLevel.push(comment);
      } else {
        const parentId = String(comment.parentCommentId);
        if (!replyMap.has(parentId)) {
          replyMap.set(parentId, []);
        }
        replyMap.get(parentId).push(comment);
      }
    }

    for (const parent of topLevel) {
      parent.replies = replyMap.get(String(parent._id)) || [];
    }

    // Guarantee that post.commentsCount strictly equals total comments
    post.commentsCount = comments.length;
    post.likesCount = Array.isArray(post.likes) ? post.likes.length : (post.likesCount || 0);

    return res.json({ post, comments: topLevel });
  } catch (err) {
    console.error('getPost error:', err);
    return res.status(500).json({ error: 'Failed to retrieve post' });
  }
}

/**
 * POST /api/community/posts
 */
export async function createPost(req, res) {
  try {
    const { title, content, category, tags = [], images = [], routeTag, author } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const customerId = author?.customerId || req.auth?.sub;
    const authorEmail = author?.email || req.auth?.email;
    const authorName = author?.name || req.auth?.name || 'TedBus Traveler';

    if (!customerId || !authorEmail) {
      return res.status(401).json({ error: 'Author identification required' });
    }

    // Safety & Quality Gate: Only verified registered travelers are permitted to post
    const verifiedCustomer = await Customer.findOne({
      $or: [
        { email: authorEmail.toLowerCase().trim() },
        ...(mongoose.isValidObjectId(customerId) ? [{ _id: customerId }] : []),
        { googleId: customerId },
      ],
    }).exec();

    if (!verifiedCustomer && !req.auth) {
      return res.status(403).json({ error: 'Only verified registered travelers with active accounts are permitted to publish community posts.' });
    }

    // Anti-spam check: prevent duplicate title within last 5 minutes by same author
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingRecent = await CommunityPost.findOne({
      'author.customerId': customerId,
      title: title.trim(),
      createdAt: { $gte: fiveMinutesAgo },
    }).exec();

    if (existingRecent) {
      return res.status(429).json({ error: 'You recently published a post with this title. Please avoid duplicate posts.' });
    }

    const badge = await computeUserBadge(customerId, authorEmail);

    const post = await CommunityPost.create({
      title: title.trim(),
      content: content.trim(),
      category: COMMUNITY_CATEGORIES.includes(category) ? category : 'General discussions',
      tags: Array.isArray(tags) ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean) : [],
      images: Array.isArray(images) ? images.filter((img) => typeof img === 'string' && img.trim()) : [],
      routeTag: routeTag?.from && routeTag?.to ? { from: routeTag.from.trim(), to: routeTag.to.trim() } : undefined,
      author: {
        customerId,
        name: authorName,
        email: authorEmail,
        picture: author?.picture || '',
        badge,
      },
      likes: [],
      likesCount: 0,
      commentsCount: 0,
    });

    return res.status(201).json(post);
  } catch (err) {
    console.error('createPost error:', err);
    return res.status(500).json({ error: 'Failed to create post' });
  }
}

/**
 * PUT /api/community/posts/:id
 */
export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { title, content, category, tags, images, routeTag } = req.body;
    const customerId = req.body.author?.customerId || req.auth?.sub;

    const post = await CommunityPost.findById(id).exec();
    if (!post || post.status === 'deleted') {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (customerId && post.author.customerId !== customerId && req.auth?.email !== post.author.email) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    if (title?.trim()) post.title = title.trim();
    if (content?.trim()) post.content = content.trim();
    if (category && COMMUNITY_CATEGORIES.includes(category)) post.category = category;
    if (Array.isArray(tags)) post.tags = tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
    if (Array.isArray(images)) post.images = images.filter((img) => typeof img === 'string' && img.trim());
    if (routeTag?.from && routeTag?.to) {
      post.routeTag = { from: routeTag.from.trim(), to: routeTag.to.trim() };
    }

    await post.save();
    return res.json(post);
  } catch (err) {
    console.error('updatePost error:', err);
    return res.status(500).json({ error: 'Failed to update post' });
  }
}

/**
 * DELETE /api/community/posts/:id
 */
export async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const customerId = req.query.customerId || req.auth?.sub;
    const customerEmail = req.query.email || req.auth?.email;

    const post = await CommunityPost.findById(id).exec();
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isOwner =
      (customerId && post.author.customerId === customerId) ||
      (customerEmail && post.author.email?.toLowerCase() === customerEmail.toLowerCase());

    if (!isOwner) {
      return res.status(403).json({ error: 'You are not authorized to delete this post' });
    }

    post.status = 'deleted';
    await post.save();

    // Soft delete associated comments
    await PostComment.updateMany({ postId: id }, { status: 'deleted' }).exec();

    return res.json({ message: 'Post deleted successfully', id });
  } catch (err) {
    console.error('deletePost error:', err);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
}

/**
 * POST /api/community/posts/:id/like
 */
export async function toggleLikePost(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const identifier = userId || req.auth?.sub || req.auth?.email;

    if (!identifier) {
      return res.status(400).json({ error: 'User identifier required' });
    }

    const post = await CommunityPost.findById(id).exec();
    if (!post || post.status !== 'published') {
      return res.status(404).json({ error: 'Post not found' });
    }

    const index = post.likes.indexOf(identifier);
    let liked = false;

    if (index === -1) {
      post.likes.push(identifier);
      liked = true;
    } else {
      post.likes.splice(index, 1);
      liked = false;
    }

    post.likesCount = post.likes.length;
    await post.save();

    if (liked && post.author.customerId !== identifier && post.author.email !== identifier) {
      void sendCommunityInteractionNotification({
        recipientId: post.author.customerId,
        recipientEmail: post.author.email,
        actorName: 'A fellow traveler',
        type: 'like',
        postTitle: post.title,
        postId: post._id,
      });
    }

    return res.json({
      liked,
      likesCount: post.likesCount,
      likes: post.likes,
    });
  } catch (err) {
    console.error('toggleLikePost error:', err);
    return res.status(500).json({ error: 'Failed to like/unlike post' });
  }
}

/**
 * POST /api/community/posts/:id/comments
 */
export async function addComment(req, res) {
  try {
    const { id: postId } = req.params;
    const { content, parentCommentId, author } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const customerId = author?.customerId || req.auth?.sub;
    const authorEmail = author?.email || req.auth?.email;
    const authorName = author?.name || req.auth?.name || 'TedBus Traveler';

    if (!customerId || !authorEmail) {
      return res.status(401).json({ error: 'Author identification required' });
    }

    // Safety & Quality Gate: Only verified registered travelers are permitted to post
    const verifiedCustomer = await Customer.findOne({
      $or: [
        { email: authorEmail.toLowerCase().trim() },
        ...(mongoose.isValidObjectId(customerId) ? [{ _id: customerId }] : []),
        { googleId: customerId },
      ],
    }).exec();

    if (!verifiedCustomer && !req.auth) {
      return res.status(403).json({ error: 'Only verified registered travelers with active accounts are permitted to publish community posts.' });
    }

    const post = await CommunityPost.findById(postId).exec();
    if (!post || post.status !== 'published') {
      return res.status(404).json({ error: 'Post not found' });
    }

    const badge = await computeUserBadge(customerId, authorEmail);

    const comment = await PostComment.create({
      postId,
      parentCommentId: parentCommentId || null,
      content: content.trim(),
      author: {
        customerId,
        name: authorName,
        email: authorEmail,
        picture: author?.picture || '',
        badge,
      },
      likes: [],
      likesCount: 0,
    });

    // Update post comments count
    post.commentsCount = await PostComment.countDocuments({
      postId,
      status: 'published',
    }).exec();
    await post.save();

    if (post.author.customerId !== customerId && post.author.email !== authorEmail) {
      void sendCommunityInteractionNotification({
        recipientId: post.author.customerId,
        recipientEmail: post.author.email,
        actorName: authorName,
        type: parentCommentId ? 'reply' : 'comment',
        postTitle: post.title,
        postId: post._id,
      });
    }

    return res.status(201).json(comment);
  } catch (err) {
    console.error('addComment error:', err);
    return res.status(500).json({ error: 'Failed to add comment' });
  }
}

/**
 * POST /api/community/comments/:id/like
 */
export async function toggleLikeComment(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const identifier = userId || req.auth?.sub || req.auth?.email;

    if (!identifier) {
      return res.status(400).json({ error: 'User identifier required' });
    }

    const comment = await PostComment.findById(id).exec();
    if (!comment || comment.status !== 'published') {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const index = comment.likes.indexOf(identifier);
    let liked = false;

    if (index === -1) {
      comment.likes.push(identifier);
      liked = true;
    } else {
      comment.likes.splice(index, 1);
      liked = false;
    }

    comment.likesCount = comment.likes.length;
    await comment.save();

    return res.json({
      liked,
      likesCount: comment.likesCount,
      likes: comment.likes,
    });
  } catch (err) {
    console.error('toggleLikeComment error:', err);
    return res.status(500).json({ error: 'Failed to like/unlike comment' });
  }
}

/**
 * DELETE /api/community/comments/:id
 */
export async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const customerId = req.query.customerId || req.auth?.sub;

    const comment = await PostComment.findById(id).exec();
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (customerId && comment.author.customerId !== customerId) {
      return res.status(403).json({ error: 'You are not authorized to delete this comment' });
    }

    comment.status = 'deleted';
    await comment.save();

    // Update post comments count with actual published count
    const activeComments = await PostComment.countDocuments({
      postId: comment.postId,
      status: 'published',
    }).exec();
    await CommunityPost.findByIdAndUpdate(comment.postId, {
      commentsCount: activeComments,
    }).exec();

    return res.json({ message: 'Comment deleted', id });
  } catch (err) {
    console.error('deleteComment error:', err);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
}

/**
 * POST /api/community/report
 */
export async function reportContent(req, res) {
  try {
    const { contentType, contentId, reason, details, reportedBy } = req.body;

    if (!contentType || !contentId || !reason) {
      return res.status(400).json({ error: 'contentType, contentId, and reason are required' });
    }

    const isAnonymous = !reportedBy?.customerId && !req.auth?.sub;
    const customerId = reportedBy?.customerId || req.auth?.sub || `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const email = reportedBy?.email || req.auth?.email || 'guest@tedbus.travel';
    const name = reportedBy?.name || req.auth?.name || 'Guest Traveler';

    // Prevent duplicate report by same registered user
    if (!isAnonymous) {
      const existing = await ContentReport.findOne({
        contentType,
        contentId,
        'reportedBy.customerId': customerId,
      }).exec();

      if (existing) {
        return res.status(409).json({ error: 'You have already reported this content' });
      }
    }

    const report = await ContentReport.create({
      contentType,
      contentId,
      reason,
      details: details?.trim() || '',
      reportedBy: { customerId, email, name },
    });

    return res.status(201).json({ message: 'Report submitted for review', reportId: report._id });
  } catch (err) {
    console.error('reportContent error:', err);
    return res.status(500).json({ error: 'Failed to report content' });
  }
}

/**
 * GET /api/community/user-stats/:customerId
 */
export async function getUserCommunityStats(req, res) {
  try {
    const { customerId } = req.params;
    const email = req.query.email;

    const [postCount, posts] = await Promise.all([
      CommunityPost.countDocuments({
        'author.customerId': customerId,
        status: 'published',
      }).exec(),
      CommunityPost.find({
        'author.customerId': customerId,
        status: 'published',
      })
        .select('likesCount commentsCount')
        .lean()
        .exec(),
    ]);

    const totalLikesReceived = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
    const commentCount = await PostComment.countDocuments({
      'author.customerId': customerId,
      status: 'published',
    }).exec();

    const badge = await computeUserBadge(customerId, email);

    return res.json({
      postCount,
      commentCount,
      totalLikesReceived,
      badge,
    });
  } catch (err) {
    console.error('getUserCommunityStats error:', err);
    return res.status(500).json({ error: 'Failed to fetch user community stats' });
  }
}
