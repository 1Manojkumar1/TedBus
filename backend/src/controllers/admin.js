import { ContentReport } from '../models/contentReport.js';
import { CommunityPost } from '../models/communityPost.js';
import { PostComment } from '../models/postComment.js';
import { Booking } from '../models/booking.js';
import { JourneyReview } from '../models/journeyReview.js';
import { Customer } from '../models/customer.js';

export async function getAdminStats(_req, res) {
  try {
    const [
      totalBookings,
      totalPosts,
      totalReviews,
      pendingReports,
      totalCustomers,
    ] = await Promise.all([
      Booking.countDocuments().exec(),
      CommunityPost.countDocuments({ status: 'published' }).exec(),
      JourneyReview.countDocuments({ status: 'published' }).exec(),
      ContentReport.countDocuments({ status: 'pending' }).exec(),
      Customer.countDocuments().exec(),
    ]);

    return res.json({
      totalBookings,
      totalPosts,
      totalReviews,
      pendingReports,
      totalCustomers,
    });
  } catch (err) {
    console.error('getAdminStats error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
}

export async function listReports(req, res) {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      ContentReport.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      ContentReport.countDocuments(filter).exec(),
    ]);

    // Populate snippets of reported content
    for (const r of reports) {
      if (r.contentType === 'post') {
        const post = await CommunityPost.findById(r.contentId).select('title content author').lean().exec();
        r.contentSnippet = post ? `"${post.title}" - ${post.content?.slice(0, 100)}...` : '[Post Deleted]';
        r.contentAuthor = post?.author?.name;
      } else if (r.contentType === 'comment') {
        const comment = await PostComment.findById(r.contentId).select('content author').lean().exec();
        r.contentSnippet = comment ? comment.content : '[Comment Deleted]';
        r.contentAuthor = comment?.author?.name;
      }
    }

    return res.json({
      reports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('listReports error:', err);
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
}

export async function resolveReport(req, res) {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'hide' | 'delete' | 'dismiss'
    const adminEmail = req.auth?.email || 'admin@tedbus.internal';

    const report = await ContentReport.findById(id).exec();
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (action === 'hide') {
      if (report.contentType === 'post') {
        await CommunityPost.findByIdAndUpdate(report.contentId, { status: 'hidden' }).exec();
      } else {
        await PostComment.findByIdAndUpdate(report.contentId, { status: 'hidden' }).exec();
      }
      report.status = 'actioned';
      report.actionTaken = 'Content hidden from community';
    } else if (action === 'delete') {
      if (report.contentType === 'post') {
        await CommunityPost.findByIdAndUpdate(report.contentId, { status: 'deleted' }).exec();
      } else {
        await PostComment.findByIdAndUpdate(report.contentId, { status: 'deleted' }).exec();
      }
      report.status = 'actioned';
      report.actionTaken = 'Content permanently removed';
    } else if (action === 'dismiss') {
      report.status = 'dismissed';
      report.actionTaken = 'Dismissed by moderator';
    }

    report.reviewedBy = adminEmail;
    report.reviewedAt = new Date();
    await report.save();

    return res.json(report);
  } catch (err) {
    console.error('resolveReport error:', err);
    return res.status(500).json({ error: 'Failed to resolve report' });
  }
}
