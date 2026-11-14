import { Booking } from '../models/booking.js';

/** How long an unpaid (pending) booking holds its seats. */
export const PENDING_HOLD_MS = 30 * 60 * 1000;

const requiredfields = [
  'customerId',
  'email',
  'phoneNumber',
  'busId',
  'departureDetails',
  'arrivalDetails',
  'duration',
];

/**
 * Bookings that still occupy seats: anything not cancelled, plus unpaid
 * bookings only while their short hold window is still open.
 */
export function activebookingfilter(now = new Date()) {
  return {
    status: { $ne: 'cancelled' },
    $or: [
      { status: { $ne: 'pending' } },
      { createdAt: { $gte: new Date(now.getTime() - PENDING_HOLD_MS) } },
    ],
  };
}

export function validatebooking(body) {
  const missing = requiredfields.filter(
    (field) => body[field] === undefined || body[field] === ''
  );
  if (missing.length) {
    return `missing required fields: ${missing.join(', ')}`;
  }

  if (!Array.isArray(body.seats) || body.seats.length === 0) {
    return 'seats must be a non-empty array';
  }

  if (typeof body.fare !== 'number' || Number.isNaN(body.fare) || body.fare < 0) {
    return 'fare must be a non-negative number';
  }

  if (!body.departureDetails?.date || !body.departureDetails?.city) {
    return 'departureDetails.date and departureDetails.city are required';
  }

  return null;
}

/** Throws an error with `status = 409` when any requested seat is taken. */
export async function assertseatsfree({ busId, date, seats, ignorebookingid }) {
  const filter = {
    busId: String(busId),
    'departureDetails.date': date,
    seats: { $in: seats.map(Number) },
    ...activebookingfilter(),
  };

  if (ignorebookingid) {
    filter._id = { $ne: ignorebookingid };
  }

  const clash = await Booking.findOne(filter).select('seats').lean().exec();
  if (!clash) {
    return;
  }

  const taken = (clash.seats ?? []).filter((seat) => seats.includes(seat));
  const error = new Error(
    `seat${taken.length === 1 ? '' : 's'} ${taken.join(', ')} already booked`
  );
  error.status = 409;
  throw error;
}

export async function persistbooking(body, overrides = {}) {
  return Booking.create({
    customerId: String(body.customerId),
    passengerDetails: body.passengerDetails ?? [],
    email: body.email,
    phoneNumber: body.phoneNumber,
    fare: body.fare,
    status: body.status ?? 'upcoming',
    bookingDate: body.bookingDate ?? new Date().toISOString().slice(0, 10),
    busId: String(body.busId),
    seats: body.seats.map(Number),
    departureDetails: body.departureDetails,
    arrivalDetails: body.arrivalDetails,
    boardingPoint: body.boardingPoint || body.departureDetails?.location || '',
    droppingPoint: body.droppingPoint || body.arrivalDetails?.location || '',
    duration: String(body.duration),
    isBusinessTravel: Boolean(body.isBusinessTravel),
    businessDetails: body.businessDetails,
    isInsurance: Boolean(body.isInsurance),
    isCovidDonated: Boolean(body.isCovidDonated),
    ...overrides,
  });
}

function departuretimestamp(departureDetails) {
  if (!departureDetails?.date) {
    return null;
  }

  const day = new Date(`${departureDetails.date}T00:00:00`);
  if (Number.isNaN(day.getTime())) {
    return null;
  }

  let hours = 0;
  const rawtime = departureDetails.time;
  if (typeof rawtime === 'number') {
    hours = rawtime;
  } else if (typeof rawtime === 'string' && rawtime.includes(':')) {
    const [h, m] = rawtime.split(':');
    hours = Number(h) + (Number(m) || 0) / 60;
  } else if (rawtime !== undefined && rawtime !== null) {
    hours = Number(rawtime);
  }

  if (!Number.isFinite(hours)) {
    return null;
  }

  day.setMinutes(day.getMinutes() + Math.round(hours * 60));
  return day;
}

/**
 * Cancellation refund policy (percentage of fare):
 *  - more than 24h before departure: 90%
 *  - 6-24h before departure: 50%
 *  - under 6h: 0%
 * Unknown departure timestamps are treated as "no refund yet" (0%).
 */
export function refundquote(departureDetails, fare, now = new Date()) {
  const departure = departuretimestamp(departureDetails);
  if (!departure) {
    return 0;
  }

  const hoursuntil = (departure.getTime() - now.getTime()) / (60 * 60 * 1000);
  let percent = 0;
  if (hoursuntil > 24) {
    percent = 0.9;
  } else if (hoursuntil > 6) {
    percent = 0.5;
  }

  return Math.round((Number(fare) || 0) * percent);
}
