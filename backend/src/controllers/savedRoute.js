import mongoose from 'mongoose';
import { SavedRoute } from '../models/savedRoute.js';

export async function listSavedRoutes(req, res) {
  try {
    const customerId = req.query.customerId || req.auth?.sub;
    if (!customerId) {
      return res.status(400).json({ error: 'customerId is required' });
    }

    const routes = await SavedRoute.find({ customerId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.json(routes);
  } catch (err) {
    console.error('listSavedRoutes error:', err);
    return res.status(500).json({ error: 'Failed to fetch saved routes' });
  }
}

export async function createSavedRoute(req, res) {
  try {
    const { title, from, to, waypoints = [], distanceKm, estimatedDuration, notes } = req.body;
    const customerId = req.body.customerId || req.auth?.sub;

    if (!customerId) {
      return res.status(401).json({ error: 'Authentication required to save routes' });
    }

    if (!title?.trim() || !from?.name || !to?.name) {
      return res.status(400).json({ error: 'Title, departure and destination are required' });
    }

    const saved = await SavedRoute.create({
      customerId,
      title: title.trim(),
      from,
      to,
      waypoints,
      distanceKm: Number(distanceKm) || 0,
      estimatedDuration: String(estimatedDuration || 'N/A'),
      notes: notes?.trim() || '',
    });

    return res.status(201).json(saved);
  } catch (err) {
    console.error('createSavedRoute error:', err);
    return res.status(500).json({ error: 'Failed to save route' });
  }
}

export async function deleteSavedRoute(req, res) {
  try {
    const { id } = req.params;
    const customerId = req.query.customerId || req.auth?.sub;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid route ID' });
    }

    const route = await SavedRoute.findById(id).exec();
    if (!route) {
      return res.status(404).json({ error: 'Saved route not found' });
    }

    if (customerId && route.customerId !== customerId) {
      return res.status(403).json({ error: 'You are not authorized to delete this route' });
    }

    await SavedRoute.findByIdAndDelete(id).exec();
    return res.json({ message: 'Saved route deleted', id });
  } catch (err) {
    console.error('deleteSavedRoute error:', err);
    return res.status(500).json({ error: 'Failed to delete saved route' });
  }
}
