const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEvent);

router.post('/', auth, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location').trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('date').isISO8601().toDate().withMessage('Please provide a valid date'),
  body('time').trim().isLength({ min: 3 }).withMessage('Time is required'),
  body('category').isIn(['Anime', 'Sports', 'Music', 'Academic', 'Religious', 'Social', 'Other']).withMessage('Invalid category')
], createEvent);

router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location').optional().trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('date').optional().isISO8601().toDate().withMessage('Please provide a valid date'),
  body('time').optional().trim().isLength({ min: 3 }).withMessage('Time is required'),
  body('category').optional().isIn(['Anime', 'Sports', 'Music', 'Academic', 'Religious', 'Social', 'Other']).withMessage('Invalid category')
], updateEvent);

router.delete('/:id', auth, deleteEvent);

module.exports = router;