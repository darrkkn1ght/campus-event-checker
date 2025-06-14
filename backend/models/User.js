const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return this.provider === 'local';
    }
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  providerId: {
    type: String,
    required: function() {
      return this.provider !== 'local';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  notificationPreferences: {
    eventReminders: { type: Boolean, default: true },
    newEvents: { type: Boolean, default: true },
    rsvpConfirmations: { type: Boolean, default: true }
  },
  themePreference: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  privacy: {
    profilePublic: { type: Boolean, default: true },
    eventsPublic: { type: Boolean, default: true },
    hideEmail: { type: Boolean, default: false },
    hideAvatar: { type: Boolean, default: false }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.provider !== 'local') return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.provider !== 'local') return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);