import mongoose from 'mongoose';
import { Booking } from '../models/booking.js';
import { Bus } from '../models/bus.js';
import {
  assertseatsfree,
  persistbooking,
  refundquote,
  validatebooking,
} from '../services/booking.js';
import { ownscustomer } from '../services/access.js';
import { sendBookingConfirmation, sendBookingCancellation } from '../services/notification.js';

export async function createbooking(req, res) {
  const body = req.body ?? {};
  const problem = validatebooking(body);
  if (problem) {
    return res.status(400).json({ error: problem });
  }

  if (!(await ownscustomer(req, body.customerId))) {
    return res.status(403).json({ error: 'you can only book tickets for your own account' });
  }

  try {
    await assertseatsfree({
      busId: body.busId,
      date: body.departureDetails.date,
      seats: body.seats,
    });
  } catch (error) {
    return res.status(error.status ?? 500).json({ error: error.message });
  }

  const booking = await persistbooking(body);
  void sendBookingConfirmation(booking);
  return res.status(201).json(booking);
}

export async function getbookingsbycustomer(req, res) {
  const { customerId } = req.params;

  if (!customerId) {
    return res.status(400).json({ error: 'customerId is required' });
  }

  if (!(await ownscustomer(req, customerId))) {
    return res.status(403).json({ error: 'you can only view your own trips' });
  }

  // Permanently purge any cancelled bookings from the database
  await Booking.deleteMany({ status: 'cancelled' }).exec();

  const bookings = await Booking.find({ customerId: String(customerId) })
    .sort({ bookingDate: -1, createdAt: -1 })
    .lean()
    .exec();

  return res.json(bookings);
}

export async function lookupBookingByPnr(req, res) {
  try {
    const { pnr } = req.params;
    if (!pnr) {
      return res.status(400).json({ error: 'PNR / Booking ID is required' });
    }

    const cleanPnr = pnr.trim();
    let query = {};
    if (mongoose.isValidObjectId(cleanPnr)) {
      query._id = cleanPnr;
    } else {
      query.$or = [
        { 'payment.reference': cleanPnr },
        { phoneNumber: cleanPnr },
      ];
    }

    const booking = await Booking.findOne(query).lean().exec();
    if (!booking) {
      return res.status(404).json({ error: `No booking found matching PNR "${cleanPnr}". Please check the number on your ticket or sign in.` });
    }

    let busName = 'TedBus Primo Express';
    if (booking.busId && mongoose.isValidObjectId(booking.busId)) {
      try {
        const bus = await Bus.findById(booking.busId).lean().exec();
        if (bus && bus.name) busName = bus.name;
      } catch {}
    }

    return res.json({
      found: true,
      pnr: String(booking._id),
      route: `${booking.departureDetails?.city || 'Origin'} ➔ ${booking.arrivalDetails?.city || 'Destination'}`,
      from: booking.departureDetails?.city,
      to: booking.arrivalDetails?.city,
      departureDate: booking.departureDetails?.date,
      departureTime: booking.departureDetails?.time,
      boardingPoint: booking.boardingPoint || booking.departureDetails?.location || 'Main Boarding Terminal',
      droppingPoint: booking.droppingPoint || booking.arrivalDetails?.location || 'Main Drop Terminal',
      seats: booking.seats?.map((s) => `Seat ${s}`) || [],
      fare: booking.fare,
      status: booking.status === 'upcoming' ? 'Confirmed & Scheduled' : booking.status === 'cancelled' ? 'Cancelled & Refunded' : 'Completed Journey',
      operator: busName,
    });
  } catch (err) {
    console.error('lookupBookingByPnr error:', err);
    return res.status(500).json({ error: 'Failed to lookup booking' });
  }
}

export async function getbookingbyid(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'invalid booking id' });
  }

  const booking = await Booking.findById(id).lean().exec();
  if (!booking) {
    return res.status(404).json({ error: 'booking not found' });
  }

  if (!(await ownscustomer(req, booking.customerId))) {
    return res.status(403).json({ error: 'you can only view your own trips' });
  }

  return res.json(booking);
}

export async function cancelbooking(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'invalid booking id' });
  }

  const booking = await Booking.findById(id).exec();
  if (!booking) {
    return res.status(404).json({ error: 'booking not found' });
  }

  if (!(await ownscustomer(req, booking.customerId))) {
    return res.status(403).json({ error: 'you can only cancel your own trips' });
  }

  if (booking.status === 'cancelled') {
    return res.status(409).json({ error: 'booking is already cancelled' });
  }

  if (booking.status === 'pending') {
    return res.status(409).json({ error: 'this booking is still awaiting payment' });
  }

  if (booking.status === 'completed') {
    return res.status(409).json({ error: 'completed trips cannot be cancelled' });
  }

  // Delete the booking permanently from the database
  await Booking.findByIdAndDelete(id).exec();

  // Send cancellation notification
  void sendBookingCancellation(booking);

  // Also remove any other lingering cancelled bookings
  await Booking.deleteMany({ status: 'cancelled' }).exec();

  return res.json({
    _id: id,
    message: 'Booking cancelled and removed from database',
    status: 'cancelled',
  });
}

/** Cancellation quote so the UI can show the refund before confirming. */
export async function getrefundquote(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'invalid booking id' });
  }

  const booking = await Booking.findById(id).lean().exec();
  if (!booking) {
    return res.status(404).json({ error: 'booking not found' });
  }

  if (!(await ownscustomer(req, booking.customerId))) {
    return res.status(403).json({ error: 'you can only view your own trips' });
  }

  const refund = refundquote(booking.departureDetails, booking.fare);
  const eligible = booking.status === 'upcoming';

  return res.json({
    refundAmount: eligible ? refund : 0,
    eligible,
    fare: booking.fare,
  });
}
