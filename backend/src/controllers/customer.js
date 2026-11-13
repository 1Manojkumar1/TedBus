import mongoose from 'mongoose';
import { Customer } from '../models/customer.js';

export async function upsertcustomer(req, res) {
  const body = req.body ?? {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const picture =
    (typeof body.picture === 'string' && body.picture) ||
    (typeof body.profilePicture === 'string' && body.profilePicture) ||
    undefined;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  if (req.auth && req.auth.email?.toLowerCase() !== email) {
    return res.status(403).json({ error: 'you can only update your own account' });
  }

  const existing = await Customer.findOne({ email }).exec();

  if (existing) {
    existing.name = name;
    if (typeof body.googleId === 'string' && body.googleId) {
      existing.googleId = body.googleId;
    }
    if (picture) {
      existing.profilePicture = picture;
    }
    await existing.save();
    return res.json(existing);
  }

  const customer = await Customer.create({
    name,
    email,
    googleId: body.googleId,
    profilePicture: picture,
  });

  return res.status(201).json(customer);
}

export async function getcustomer(req, res) {
  const { id } = req.params;

  const filter = mongoose.isValidObjectId(id) ? { _id: id } : { email: id.toLowerCase() };
  const customer = await Customer.findOne(filter).exec();

  if (!customer) {
    return res.status(404).json({ error: 'customer not found' });
  }

  if (req.auth && customer.email?.toLowerCase() !== req.auth.email?.toLowerCase()) {
    return res.status(403).json({ error: 'you can only view your own account' });
  }

  return res.json(customer);
}
