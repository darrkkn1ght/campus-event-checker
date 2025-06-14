const Event = require('../models/Event');
const { validationResult } = require('express-validator');

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

    res.json(event);
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

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
};