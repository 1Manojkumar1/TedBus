import { SupportTicket } from '../models/supportTicket.js';
import { Customer } from '../models/customer.js';
import { sendNotification } from '../services/notification.js';

export async function createTicket(req, res) {
  try {
    const { category, pnr, name, email, phone, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message description are required.' });
    }

    const ticketId = `TB-SUP-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTicket = new SupportTicket({
      ticketId,
      category: category || 'General Query',
      pnr: pnr ? String(pnr).trim() : undefined,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      message: String(message).trim(),
      status: 'open',
    });

    await newTicket.save();

    // If user has a registered customer account, send them an in-app notification
    try {
      const customer = await Customer.findOne({ email: newTicket.email }).lean().exec();
      if (customer && customer._id) {
        await sendNotification({
          customerId: String(customer._id),
          type: 'support_ticket',
          channel: 'in_app',
          title: `Support Ticket Lodged (#${ticketId})`,
          message: `Your query regarding "${newTicket.category}" has been received. Our team will resolve it within 2 hours.`,
          data: { ticketId, status: 'open' },
        });
      }
    } catch (notifErr) {
      console.warn('Could not dispatch support confirmation notification:', notifErr);
    }

    return res.status(201).json({
      success: true,
      ticketId,
      ticket: newTicket,
      message: `Support ticket #${ticketId} created successfully.`,
    });
  } catch (err) {
    console.error('createTicket error:', err);
    return res.status(500).json({ error: 'Failed to create support ticket' });
  }
}

export async function getTicketStatus(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Ticket ID is required' });
    }

    const ticket = await SupportTicket.findOne({
      $or: [{ ticketId: id.toUpperCase() }, { _id: id }],
    }).lean().exec();

    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    return res.json(ticket);
  } catch (err) {
    console.error('getTicketStatus error:', err);
    return res.status(500).json({ error: 'Failed to retrieve ticket status' });
  }
}

export async function listAllTickets(req, res) {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean().exec(),
      SupportTicket.countDocuments(filter).exec(),
    ]);

    return res.json({ tickets, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error('listAllTickets error:', err);
    return res.status(500).json({ error: 'Failed to list support tickets' });
  }
}
