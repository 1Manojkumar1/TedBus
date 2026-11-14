import mongoose from 'mongoose';
import { JourneyReview } from '../models/journeyReview.js';
import { Booking } from '../models/booking.js';

export async function createReview(req, res) {
  try {
    const {
      bookingId,
      rating,
      aspectRatings,
      headline,
      comment,
      author,
    } = req.body;

    if (!bookingId || !rating || !comment?.trim()) {
      return res.status(400).json({ error: 'bookingId, rating (1-5), and comment are required' });
    }

    const customerId = author?.customerId || req.auth?.sub;
    const authorEmail = author?.email || req.auth?.email;
    const authorName = author?.name || req.auth?.name || 'Verified Passenger';

    if (!customerId || !authorEmail) {
      return res.status(401).json({ error: 'Author identification required' });
    }

    // Verify eligible booking
    let booking = null;
    if (mongoose.isValidObjectId(bookingId)) {
      booking = await Booking.findById(bookingId).lean().exec();
    }
    if (!booking) {
      booking = await Booking.findOne({
        _id: bookingId,
        $or: [{ customerId }, { email: authorEmail.toLowerCase() }],
      }).lean().exec();
    }

    if (!booking) {
      return res.status(403).json({
        error: 'Only passengers with a verified booking can submit a review for this journey.',
      });
    }

    // Check if review already exists for this booking
    const existing = await JourneyReview.findOne({ bookingId: String(bookingId) }).exec();
    if (existing) {
      return res.status(409).json({ error: 'You have already submitted a review for this trip.' });
    }

    const review = await JourneyReview.create({
      bookingId: String(bookingId),
      busId: String(booking.busId),
      route: {
        from: booking.departureDetails?.city || 'Origin',
        to: booking.arrivalDetails?.city || 'Destination',
      },
      author: {
        customerId,
        name: authorName,
        email: authorEmail,
        picture: author?.picture || '',
      },
      rating: Math.min(5, Math.max(1, Number(rating))),
      aspectRatings: {
        punctuality: Math.min(5, Math.max(1, Number(aspectRatings?.punctuality || 5))),
        cleanliness: Math.min(5, Math.max(1, Number(aspectRatings?.cleanliness || 5))),
        comfort: Math.min(5, Math.max(1, Number(aspectRatings?.comfort || 5))),
        staff: Math.min(5, Math.max(1, Number(aspectRatings?.staff || 5))),
      },
      headline: headline?.trim() || '',
      comment: comment.trim(),
      travelDate: booking.departureDetails?.date || new Date().toISOString().split('T')[0],
      isVerifiedPassenger: true,
      helpfulVotes: [],
      helpfulCount: 0,
    });

    return res.status(201).json(review);
  } catch (err) {
    console.error('createReview error:', err);
    return res.status(500).json({ error: 'Failed to submit journey review' });
  }
}

export async function updateReview(req, res) {
  try {
    const { id } = req.params;
    const { rating, aspectRatings, headline, comment } = req.body;
    const customerId = req.body.author?.customerId || req.auth?.sub;

    const review = await JourneyReview.findById(id).exec();
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const authorEmail = req.body.author?.email || req.auth?.email;
    const authorMatches = !customerId ||
      review.author.customerId === customerId ||
      (authorEmail && review.author.email && review.author.email.toLowerCase() === authorEmail.toLowerCase());

    if (!authorMatches) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    // Check 24-hour edit window
    const now = Date.now();
    const createdTime = new Date(review.createdAt).getTime();
    const hoursSinceCreation = (now - createdTime) / (1000 * 60 * 60);

    if (hoursSinceCreation > 24) {
      return res.status(403).json({
        error: 'The 24-hour edit window for this review has passed. Reviews cannot be modified after 24 hours.',
      });
    }

    if (rating) review.rating = Math.min(5, Math.max(1, Number(rating)));
    if (aspectRatings) {
      review.aspectRatings = {
        punctuality: Math.min(5, Math.max(1, Number(aspectRatings.punctuality || 5))),
        cleanliness: Math.min(5, Math.max(1, Number(aspectRatings.cleanliness || 5))),
        comfort: Math.min(5, Math.max(1, Number(aspectRatings.comfort || 5))),
        staff: Math.min(5, Math.max(1, Number(aspectRatings.staff || 5))),
      };
    }
    if (headline !== undefined) review.headline = headline.trim();
    if (comment?.trim()) review.comment = comment.trim();

    await review.save();
    return res.json(review);
  } catch (err) {
    console.error('updateReview error:', err);
    return res.status(500).json({ error: 'Failed to update review' });
  }
}

export async function getBusReviews(req, res) {
  try {
    const { busId } = req.params;
    const reviews = await JourneyReview.find({
      busId: String(busId),
      status: 'published',
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const count = reviews.length;
    let avgRating = 0;
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const aspectTotals = { punctuality: 0, cleanliness: 0, comfort: 0, staff: 0 };

    if (count > 0) {
      let sumRating = 0;
      for (const r of reviews) {
        sumRating += r.rating;
        const rounded = Math.round(r.rating);
        starCounts[rounded] = (starCounts[rounded] || 0) + 1;
        aspectTotals.punctuality += r.aspectRatings?.punctuality || 5;
        aspectTotals.cleanliness += r.aspectRatings?.cleanliness || 5;
        aspectTotals.comfort += r.aspectRatings?.comfort || 5;
        aspectTotals.staff += r.aspectRatings?.staff || 5;
      }

      avgRating = Number((sumRating / count).toFixed(1));
      aspectTotals.punctuality = Number((aspectTotals.punctuality / count).toFixed(1));
      aspectTotals.cleanliness = Number((aspectTotals.cleanliness / count).toFixed(1));
      aspectTotals.comfort = Number((aspectTotals.comfort / count).toFixed(1));
      aspectTotals.staff = Number((aspectTotals.staff / count).toFixed(1));
    }

    return res.json({
      reviews,
      summary: {
        totalReviews: count,
        averageRating: avgRating,
        starCounts,
        aspectAverages: aspectTotals,
      },
    });
  } catch (err) {
    console.error('getBusReviews error:', err);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

export async function getUserReviews(req, res) {
  try {
    const { customerId } = req.params;
    const email = req.query.email;

    const filter = {
      $or: [{ 'author.customerId': customerId }],
      status: 'published',
    };
    if (email) {
      filter.$or.push({ 'author.email': email.toLowerCase() });
    }

    const reviews = await JourneyReview.find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.json(reviews);
  } catch (err) {
    console.error('getUserReviews error:', err);
    return res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
}

export async function toggleHelpful(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const voter = userId || req.auth?.sub || req.auth?.email;

    if (!voter) {
      return res.status(400).json({ error: 'User identifier required' });
    }

    const review = await JourneyReview.findById(id).exec();
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const index = review.helpfulVotes.indexOf(voter);
    let voted = false;

    if (index === -1) {
      review.helpfulVotes.push(voter);
      voted = true;
    } else {
      review.helpfulVotes.splice(index, 1);
      voted = false;
    }

    review.helpfulCount = review.helpfulVotes.length;
    await review.save();

    return res.json({
      voted,
      helpfulCount: review.helpfulCount,
    });
  } catch (err) {
    console.error('toggleHelpful error:', err);
    return res.status(500).json({ error: 'Failed to vote on review' });
  }
}
