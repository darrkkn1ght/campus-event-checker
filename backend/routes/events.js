const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEvent);

router.post('/', auth, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location').trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('date').isISO8601().toDate().withMessage('Please provide a valid date'),
  body('time').trim().isLength({ min: 3 }).withMessage('Time is required'),
  body('category').isIn(['Anime', 'Sports', 'Music', 'Academic', 'Religious', 'Social', 'Other']).withMessage('Invalid category')
], eventController.createEvent);

router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location').optional().trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('date').optional().isISO8601().toDate().withMessage('Please provide a valid date'),
  body('time').optional().trim().isLength({ min: 3 }).withMessage('Time is required'),
  body('category').optional().isIn(['Anime', 'Sports', 'Music', 'Academic', 'Religious', 'Social', 'Other']).withMessage('Invalid category')
], eventController.updateEvent);

router.delete('/:id', auth, eventController.deleteEvent);

// RSVP for free event
router.post('/:id/rsvp', eventController.rsvpFreeEvent);

// Pay for paid event (Paystack)
router.post('/:id/pay', eventController.payForEventWithPaystack);

// Paystack payment webhook
router.post('/paystack/webhook', eventController.handlePaystackWebhook);

// List tickets for authenticated user
router.get('/tickets/my', auth, eventController.getMyTickets);

// Ticket QR code image
router.get('/tickets/:ticketId/qr', auth, eventController.getTicketQRCode);
// Ticket PDF download
router.get('/tickets/:ticketId/download', auth, eventController.downloadTicketPDF);

// List attendees for a specific event (organizer only)
router.get('/:id/attendees', auth, eventController.getEventAttendees);

// Check-in ticket for event (organizer only)
router.post('/:eventId/checkin', auth, eventController.checkInTicket);

// User cancels their ticket (refund if paid)
router.post('/tickets/:ticketId/cancel', auth, eventController.cancelTicket);
// Organizer cancels event (mass refund/notify)
router.post('/:id/cancel', auth, eventController.cancelEvent);

// Event analytics for organizer
router.get('/:id/analytics', auth, eventController.eventAnalytics);

// Join waitlist for event
router.post('/:id/waitlist', auth, eventController.joinWaitlist);
// View waitlist (organizer only)
router.get('/:id/waitlist', auth, eventController.viewWaitlist);

module.exports = router;