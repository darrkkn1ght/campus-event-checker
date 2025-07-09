const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.listTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('user event');
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.analytics = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    const ticketCount = await Ticket.countDocuments();
    const paidTicketCount = await Ticket.countDocuments({ paymentProvider: 'paystack', paymentStatus: 'paid' });
    const totalRevenue = await Ticket.aggregate([
      { $match: { paymentProvider: 'paystack', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    res.json({
      userCount,
      eventCount,
      ticketCount,
      paidTicketCount,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 