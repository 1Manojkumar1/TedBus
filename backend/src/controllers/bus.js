import mongoose from 'mongoose';
import { Bus } from '../models/bus.js';
import { paginated, parsepagination } from '../utils/pagination.js';

export async function listbuses(req, res) {
  const { route } = req.query;
  const filter = {};

  if (route) {
    if (!mongoose.isValidObjectId(route)) {
      return res.status(400).json({ error: 'invalid route id' });
    }
    filter.routes = route;
  }

  const { page, limit, skip, requested } = parsepagination(req.query);
  const query = Bus.find(filter).populate('routes');

  if (requested) {
    query.skip(skip).limit(limit);
  }

  const [buses, total] = await Promise.all([
    query.lean().exec(),
    requested ? Bus.countDocuments(filter).exec() : Promise.resolve(0),
  ]);

  return res.json(requested ? paginated(buses, total, { page, limit }) : buses);
}

export async function getbus(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'invalid bus id' });
  }

  const bus = await Bus.findById(id).populate('routes').lean().exec();
  if (!bus) {
    return res.status(404).json({ error: 'bus not found' });
  }

  return res.json(bus);
}

export async function createbus(req, res) {
  const body = req.body ?? {};
  const required = ['operatorName', 'busType', 'departureTime', 'routes', 'images'];
  const missing = required.filter((field) => !body[field]);

  if (missing.length) {
    return res.status(400).json({ error: `missing required fields: ${missing.join(', ')}` });
  }

  if (!mongoose.isValidObjectId(body.routes)) {
    return res.status(400).json({ error: 'routes must be a valid route id' });
  }

  const bus = await Bus.create({
    operatorName: body.operatorName,
    busType: body.busType,
    departureTime: body.departureTime,
    rating: Array.isArray(body.rating) ? body.rating : [],
    totalSeats: body.totalSeats,
    routes: body.routes,
    images: body.images,
    liveTracking: body.liveTracking ?? 1,
    reschedulable: body.reschedulable ?? 0,
  });

  return res.status(201).json(bus);
}
