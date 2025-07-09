const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Anime', 'Sports', 'Music', 'Academic', 'Religious', 'Social', 'Other']
  },
  image: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    required: function() { return this.isPaid; },
    min: 0
  },
  ticketsAvailable: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  cancelled: {
    type: Boolean,
    default: false
  },
  waitlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

module.exports = mongoose.model('Event', eventSchema);