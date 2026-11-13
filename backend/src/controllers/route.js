import mongoose from 'mongoose';
import { Route } from '../models/route.js';
import { Bus } from '../models/bus.js';
import { Booking } from '../models/booking.js';
import { activebookingfilter } from '../services/booking.js';
import { paginated, parsepagination } from '../utils/pagination.js';

function escaperegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function listroutes(req, res) {
  const { page, limit, skip, requested } = parsepagination(req.query);
  const query = Route.find().sort({ 'departureLocation.name': 1, 'arrivalLocation.name': 1 });

  if (requested) {
    query.skip(skip).limit(limit);
  }

  const [routes, total] = await Promise.all([
    query.lean().exec(),
    requested ? Route.countDocuments().exec() : Promise.resolve(0),
  ]);

  return res.json(requested ? paginated(routes, total, { page, limit }) : routes);
}

export async function getbusforroute(req, res) {
  const { departure, arrival, date } = req.params;

  if (!departure || !arrival || !date) {
    return res.status(400).json({ error: 'departure, arrival and date are required' });
  }

  const route = await Route.findOne({
    'departureLocation.name': new RegExp(`^${escaperegex(departure.trim())}$`, 'i'),
    'arrivalLocation.name': new RegExp(`^${escaperegex(arrival.trim())}$`, 'i'),
  })
    .lean()
    .exec();

  if (!route) {
    return res.status(404).json({ error: `no route found from ${departure} to ${arrival}` });
  }

  const matchedBuses = await Bus.find({ routes: route._id }).lean().exec();
  const busids = matchedBuses.map((bus) => bus._id.toString());

  const objectIds = busids.map((id) => (mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id));
  const bookings = busids.length
    ? await Booking.find({
        $or: [{ busId: { $in: busids } }, { busId: { $in: objectIds } }],
        'departureDetails.date': date,
        status: { $ne: 'cancelled' },
      })
        .select('busId seats')
        .lean()
        .exec()
    : [];

  const busidwithseatobj = {};
  for (const busid of busids) {
    busidwithseatobj[busid] = [];
  }
  for (const booking of bookings) {
    const key = String(booking.busId);
    if (busidwithseatobj[key]) {
      busidwithseatobj[key] = [...busidwithseatobj[key], ...booking.seats];
    }
  }

  return res.json({ route, matchedBuses, busidwithseatobj });
}

export async function createroute(req, res) {
  const body = req.body ?? {};
  const departure = body?.departureLocation?.name;
  const arrival = body?.arrivalLocation?.name;

  if (!departure || !arrival || body.duration === undefined) {
    return res.status(400).json({ error: 'departureLocation.name, arrivalLocation.name and duration are required' });
  }

  const route = await Route.create({
    departureLocation: body.departureLocation,
    arrivalLocation: body.arrivalLocation,
    duration: Number(body.duration),
  });

  return res.status(201).json(route);
}
