const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// List all users
router.get('/users', adminAuth, adminController.listUsers);
// List all events
router.get('/events', adminAuth, adminController.listEvents);
// List all tickets
router.get('/tickets', adminAuth, adminController.listTickets);
// Platform analytics
router.get('/analytics', adminAuth, adminController.analytics);

// TODO: Add endpoints for deleting/banning users, deleting/editing events, etc.

module.exports = router; 