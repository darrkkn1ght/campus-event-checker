const Event = require('../models/Event');
const { validationResult } = require('express-validator');
const paystack = require('../utils/paystack');
const Ticket = require('../models/Ticket');
const crypto = require('crypto');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const { sendMail } = require('../utils/mailer');

const getEvents = async (req, res) => {
  try {
    const { category, location, date } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Add remaining tickets info
    let remainingTickets = null;
    if (event.ticketsAvailable !== null && event.ticketsAvailable !== undefined) {
      const sold = await getTicketsCount(event._id);
      remainingTickets = Math.max(0, event.ticketsAvailable - sold);
    }
    res.json({ ...event.toObject(), remainingTickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, description, location, date, time, category } = req.body;

    const event = new Event({
      title,
      description,
      location,
      date,
      time,
      category,
      createdBy: req.user._id
    });

    await event.save();
    await event.populate('createdBy', 'name email');

    // Send notification emails to users who want new event notifications
    try {
      const User = require('../models/User');
      const { sendMail } = require('../utils/mailer');
      const usersToNotify = await User.find({ 'notificationPreferences.newEvents': true });
      const emailPromises = usersToNotify.map(user =>
        sendMail({
          to: user.email,
          subject: `New Event: ${event.title}`,
          text: `A new event has been posted: ${event.title}\n\n${event.description}\n\nLocation: ${event.location}\nDate: ${event.date}\nTime: ${event.time}`,
          html: `<h2>New Event: ${event.title}</h2><p>${event.description}</p><p><b>Location:</b> ${event.location}<br/><b>Date:</b> ${event.date}<br/><b>Time:</b> ${event.time}</p>`
        })
      );
      await Promise.all(emailPromises);
    } catch (notifyErr) {
      console.error('Failed to send event notification emails:', notifyErr);
    }

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const { title, description, location, date, time, category } = req.body;

    event.title = title || event.title;
    event.description = description || event.description;
    event.location = location || event.location;
    event.date = date || event.date;
    event.time = time || event.time;
    event.category = category || event.category;

    await event.save();
    await event.populate('createdBy', 'name email');

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper to generate QR code buffer
async function generateQRCodeBuffer(data) {
  const qrData = JSON.stringify(data);
  const qrImage = await QRCode.toDataURL(qrData);
  return Buffer.from(qrImage.split(',')[1], 'base64');
}

// Helper to generate PDF ticket buffer
async function generatePDFBuffer(ticket, user, event) {
  const qrBuffer = await generateQRCodeBuffer({ ticketId: ticket._id, reference: ticket.reference });
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.fontSize(20).text('Event Ticket', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Event: ${event.title}`);
    doc.text(`Date: ${event.date.toLocaleString()}`);
    doc.text(`Time: ${event.time}`);
    doc.text(`Location: ${event.location}`);
    doc.text(`Category: ${event.category}`);
    doc.text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Ticket ID: ${ticket._id}`);
    doc.text(`Reference: ${ticket.reference || 'N/A'}`);
    doc.moveDown();
    doc.text('Show this ticket at the event.');
    doc.image(qrBuffer, { fit: [150, 150], align: 'center' });
    doc.end();
  });
}

// Helper to send confirmation email
async function sendTicketEmail({ user, event, ticket }) {
  const qrBuffer = await generateQRCodeBuffer({ ticketId: ticket._id, reference: ticket.reference });
  const pdfBuffer = await generatePDFBuffer(ticket, user, event);
  const subject = `Your Ticket for ${event.title} – CampusEvents Confirmation`;
  const html = `<h2>🎉 Thank You for Registering for ${event.title}!</h2>
<p>Hi ${user.name},</p>
<p>We're excited to confirm your spot at <strong>${event.title}</strong>.<br>
<b>Date:</b> ${event.date.toLocaleString()}<br>
<b>Time:</b> ${event.time}<br>
<b>Location:</b> ${event.location}</p>
<p>Attached to this email, you'll find your official event ticket in PDF format and a QR code image. Please bring either the PDF or show the QR code on your phone at the event entrance for a smooth check-in.</p>
<p><b>Event Details:</b><br>${event.description}</p>
<p>If you have any questions, feel free to reply to this email.<br>We look forward to seeing you at the event!</p>
<p>Best regards,<br><b>The CampusEvents Team</b></p>
<hr><small>This email was sent automatically by CampusEvents. If you did not register for this event, please ignore this message.</small>`;
  const text = `Thank you for registering for ${event.title}!

Hi ${user.name},

We're excited to confirm your spot at ${event.title}.
Date: ${event.date.toLocaleString()}
Time: ${event.time}
Location: ${event.location}

Event Details:
${event.description}

Attached to this email, you'll find your official event ticket (PDF) and a QR code image. Please bring either the PDF or show the QR code on your phone at the event entrance for a smooth check-in.

If you have any questions, reply to this email.
We look forward to seeing you at the event!

Best regards,
The CampusEvents Team

---
This email was sent automatically by CampusEvents. If you did not register for this event, please ignore this message.`;
  await sendMail({
    to: user.email,
    subject,
    text,
    html,
    attachments: [
      { filename: `ticket-${ticket._id}.pdf`, content: pdfBuffer },
      { filename: `ticket-${ticket._id}.png`, content: qrBuffer }
    ]
  });
}

// Helper to notify organizer
async function notifyOrganizer({ organizer, event, attendee }) {
  const subject = `New Registration for ${event.title}`;
  const html = `<p>Hi ${organizer.name},</p>
<p>${attendee.name} (${attendee.email}) has just registered for your event: <strong>${event.title}</strong>.</p>
<p>View your event dashboard for more details.</p>
<p>– CampusEvents</p>`;
  const text = `Hi ${organizer.name},

${attendee.name} (${attendee.email}) has just registered for your event: ${event.title}.

View your event dashboard for more details.

– CampusEvents`;
  await sendMail({
    to: organizer.email,
    subject,
    text,
    html
  });
}

// Helper to count tickets for an event
async function getTicketsCount(eventId) {
  return Ticket.countDocuments({ event: eventId });
}

// Helper to refund Paystack transaction
async function refundPaystack(reference) {
  try {
    const response = await paystack.post('/refund', { transaction: reference });
    return response.data;
  } catch (error) {
    console.error('Paystack refund error:', error.response?.data || error.message);
    return null;
  }
}

// Helper to notify next waitlist user
async function notifyNextWaitlistUser(event) {
  if (!event.waitlist || event.waitlist.length === 0) return;
  // Remove and get the next user
  const nextUserId = event.waitlist.shift();
  await event.save();
  const User = require('../models/User');
  const user = await User.findById(nextUserId);
  if (!user) return;
  // Send claim email
  const claimUrl = `${process.env.FRONTEND_URL || 'https://campusevents.com'}/events/${event._id}/claim?user=${user._id}`;
  await sendMail({
    to: user.email,
    subject: `A spot is now available for ${event.title}!`,
    text: `Hi ${user.name},\n\nA spot has opened up for the event "${event.title}".\n\nClick here to claim your spot: ${claimUrl}\n\nHurry, spots are limited!\n\nBest regards,\nCampusEvents Team`,
    html: `<p>Hi ${user.name},</p><p>A spot has opened up for the event <b>${event.title}</b>.<br><a href="${claimUrl}">Click here to claim your spot</a>.<br>Hurry, spots are limited!</p><p>Best regards,<br>CampusEvents Team</p>`
  });
}

const rsvpFreeEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const event = await Event.findById(eventId).populate('createdBy');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.isPaid) {
      return res.status(400).json({ message: 'This event requires payment. Use the payment endpoint.' });
    }
    // Capacity check
    if (event.ticketsAvailable !== null && event.ticketsAvailable !== undefined) {
      const sold = await getTicketsCount(event._id);
      if (sold >= event.ticketsAvailable) {
        return res.status(400).json({ message: 'This event is full. No more tickets available.' });
      }
    }
    // Check if user already has a ticket
    const existingTicket = await Ticket.findOne({ user: user._id, event: event._id });
    if (existingTicket) {
      return res.status(200).json({ message: 'You have already RSVPed for this event.', ticket: existingTicket });
    }
    // Create free ticket
    const ticket = await Ticket.create({
      user: user._id,
      event: event._id,
      amountPaid: 0,
      paymentStatus: 'paid',
      paymentProvider: 'free',
      reference: undefined
    });
    // Send confirmation email
    await sendTicketEmail({ user, event, ticket });
    // Notify organizer
    await notifyOrganizer({ organizer: event.createdBy, event, attendee: user });
    res.status(201).json({ message: 'RSVP successful! Confirmation email sent.', ticket });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const payForEventWithPaystack = async (req, res) => {
  try {
    const eventId = req.params.id;
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (!event.isPaid) {
      return res.status(400).json({ message: 'This event is free. Use RSVP instead.' });
    }
    if (!event.price || event.price <= 0) {
      return res.status(400).json({ message: 'Invalid event price.' });
    }
    // Capacity check
    if (event.ticketsAvailable !== null && event.ticketsAvailable !== undefined) {
      const sold = await getTicketsCount(event._id);
      if (sold >= event.ticketsAvailable) {
        return res.status(400).json({ message: 'This event is full. No more tickets available.' });
      }
    }
    // Convert NGN to kobo (Paystack expects amount in kobo)
    const amount = event.price * 100;
    // Initialize Paystack transaction
    const response = await paystack.post('/transaction/initialize', {
      email: user.email,
      amount,
      metadata: {
        eventId: event._id.toString(),
        userId: user._id.toString(),
        eventTitle: event.title
      }
    });
    const { authorization_url, reference } = response.data.data;
    res.json({
      paymentUrl: authorization_url,
      reference
    });
  } catch (error) {
    console.error('Paystack payment error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
};

const handlePaystackWebhook = async (req, res) => {
  try {
    // 1. Verify Paystack signature
    const paystackSignature = req.headers['x-paystack-signature'];
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto.createHmac('sha512', secret).update(req.body).digest('hex');
    if (hash !== paystackSignature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }
    // 2. Parse event data
    const event = JSON.parse(req.body.toString('utf8'));
    if (event.event !== 'charge.success') {
      return res.status(200).json({ message: 'Event ignored' });
    }
    const data = event.data;
    // 3. Check if ticket already exists for this reference
    const existingTicket = await Ticket.findOne({ reference: data.reference });
    if (existingTicket) {
      return res.status(200).json({ message: 'Ticket already processed' });
    }
    // 4. Create paid ticket
    const userId = data.metadata?.userId;
    const eventId = data.metadata?.eventId;
    if (!userId || !eventId) {
      return res.status(400).json({ message: 'Missing metadata' });
    }
    const User = require('../models/User');
    const user = await User.findById(userId);
    const eventDoc = await Event.findById(eventId).populate('createdBy');
    // Capacity check
    if (eventDoc.ticketsAvailable !== null && eventDoc.ticketsAvailable !== undefined) {
      const sold = await getTicketsCount(eventDoc._id);
      if (sold >= eventDoc.ticketsAvailable) {
        return res.status(400).json({ message: 'This event is full. No more tickets available.' });
      }
    }
    const ticket = await Ticket.create({
      user: userId,
      event: eventId,
      amountPaid: data.amount / 100, // convert kobo to NGN
      paymentStatus: 'paid',
      paymentProvider: 'paystack',
      reference: data.reference
    });
    // Send confirmation email
    await sendTicketEmail({ user, event: eventDoc, ticket });
    // Notify organizer
    await notifyOrganizer({ organizer: eventDoc.createdBy, event: eventDoc, attendee: user });
    res.status(200).json({ message: 'Ticket created and email sent' });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(400).json({ message: 'Webhook error', error: error.message });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const tickets = await Ticket.find({ user: user._id })
      .populate('event')
      .sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getEventAttendees = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Only the event organizer can view attendees.' });
    }
    const tickets = await Ticket.find({ event: eventId })
      .populate('user')
      .sort({ createdAt: -1 });
    res.json({ attendees: tickets });
  } catch (error) {
    console.error('Get event attendees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTicketQRCode = async (req, res) => {
  try {
    const user = req.user;
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findById(ticketId).populate('event');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (ticket.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'You do not have access to this ticket.' });
    }
    // Generate QR code with ticket ID and reference
    const qrData = JSON.stringify({ ticketId: ticket._id, reference: ticket.reference });
    res.setHeader('Content-Type', 'image/png');
    QRCode.toFileStream(res, qrData, { type: 'png' });
  } catch (error) {
    console.error('QR code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const downloadTicketPDF = async (req, res) => {
  try {
    const user = req.user;
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findById(ticketId).populate('event');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (ticket.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'You do not have access to this ticket.' });
    }
    // Generate QR code as data URL
    const qrData = JSON.stringify({ ticketId: ticket._id, reference: ticket.reference });
    const qrImage = await QRCode.toDataURL(qrData);
    // Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticket._id}.pdf"`);
    doc.fontSize(20).text('Event Ticket', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Event: ${ticket.event.title}`);
    doc.text(`Date: ${ticket.event.date.toLocaleString()}`);
    doc.text(`Location: ${ticket.event.location}`);
    doc.text(`Category: ${ticket.event.category}`);
    doc.text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Ticket ID: ${ticket._id}`);
    doc.text(`Reference: ${ticket.reference || 'N/A'}`);
    doc.moveDown();
    doc.text('Show this ticket at the event.');
    // Embed QR code
    const qrBuffer = Buffer.from(qrImage.split(',')[1], 'base64');
    doc.image(qrBuffer, { fit: [150, 150], align: 'center' });
    doc.end();
    doc.pipe(res);
  } catch (error) {
    console.error('PDF ticket error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const checkInTicket = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.eventId;
    const { ticketId } = req.body;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Only the event organizer can check in tickets.' });
    }
    const ticket = await Ticket.findOne({ _id: ticketId, event: eventId });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found for this event.' });
    }
    if (ticket.checkedIn) {
      return res.status(400).json({ message: 'Ticket already checked in.' });
    }
    ticket.checkedIn = true;
    await ticket.save();
    res.json({ message: 'Ticket checked in successfully.', ticket });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const cancelTicket = async (req, res) => {
  try {
    const user = req.user;
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findById(ticketId).populate('event');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (ticket.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to cancel this ticket.' });
    }
    if (ticket.cancelled) {
      return res.status(400).json({ message: 'Ticket already cancelled.' });
    }
    // If paid, attempt refund
    let refundResult = null;
    if (ticket.paymentProvider === 'paystack' && ticket.reference) {
      refundResult = await refundPaystack(ticket.reference);
    }
    ticket.cancelled = true;
    await ticket.save();
    // Notify next waitlist user if event is not full
    const event = await Event.findById(ticket.event);
    const sold = await getTicketsCount(event._id);
    if (event.ticketsAvailable && sold < event.ticketsAvailable) {
      await notifyNextWaitlistUser(event);
    }
    res.json({ message: 'Ticket cancelled.', refund: refundResult });
  } catch (error) {
    console.error('Cancel ticket error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const cancelEvent = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Only the event organizer can cancel this event.' });
    }
    if (event.cancelled) {
      return res.status(400).json({ message: 'Event already cancelled.' });
    }
    event.cancelled = true;
    await event.save();
    // Cancel all tickets and attempt refunds for paid tickets
    const tickets = await Ticket.find({ event: eventId, cancelled: false });
    for (const ticket of tickets) {
      if (ticket.paymentProvider === 'paystack' && ticket.reference) {
        await refundPaystack(ticket.reference);
      }
      ticket.cancelled = true;
      await ticket.save();
      // Notify attendee
      const User = require('../models/User');
      const attendee = await User.findById(ticket.user);
      await sendMail({
        to: attendee.email,
        subject: `Event Cancelled: ${event.title}`,
        text: `Dear ${attendee.name},\n\nWe regret to inform you that the event "${event.title}" has been cancelled. If you paid for a ticket, a refund will be processed.\n\nBest regards,\nCampusEvents Team`,
        html: `<p>Dear ${attendee.name},</p><p>We regret to inform you that the event <b>${event.title}</b> has been <b>cancelled</b>.<br>If you paid for a ticket, a refund will be processed.</p><p>Best regards,<br>CampusEvents Team</p>`
      });
    }
    res.json({ message: 'Event and all tickets cancelled. Attendees notified.' });
  } catch (error) {
    console.error('Cancel event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const eventAnalytics = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Only the event organizer can view analytics.' });
    }
    const tickets = await Ticket.find({ event: eventId });
    const paidTickets = tickets.filter(t => t.paymentProvider === 'paystack' && t.paymentStatus === 'paid');
    const totalRevenue = paidTickets.reduce((sum, t) => sum + t.amountPaid, 0);
    const checkIns = tickets.filter(t => t.checkedIn).length;
    const attendees = await Ticket.find({ event: eventId }).populate('user');
    res.json({
      totalTickets: tickets.length,
      paidTickets: paidTickets.length,
      totalRevenue,
      checkIns,
      attendees
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const joinWaitlist = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.waitlist.includes(user._id)) {
      return res.status(400).json({ message: 'You are already on the waitlist.' });
    }
    event.waitlist.push(user._id);
    await event.save();
    res.json({ message: 'Added to waitlist.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const viewWaitlist = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;
    const event = await Event.findById(eventId).populate('waitlist');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Only the event organizer can view the waitlist.' });
    }
    res.json({ waitlist: event.waitlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpFreeEvent,
  payForEventWithPaystack,
  handlePaystackWebhook,
  getMyTickets,
  getTicketQRCode,
  downloadTicketPDF,
  getEventAttendees,
  checkInTicket,
  cancelTicket,
  cancelEvent,
  eventAnalytics,
  joinWaitlist,
  viewWaitlist
};