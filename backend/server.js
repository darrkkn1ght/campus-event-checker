const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import passport config
require('./config/passport');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://192.168.234.235:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedDatabase();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Seed database with sample events
const seedDatabase = async () => {
  try {
    const Event = require('./models/Event');
    const User = require('./models/User');
    
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      // Create a default user for seeding
      let seedUser = await User.findOne({ email: 'admin@campus.com' });
      if (!seedUser) {
        seedUser = new User({
          name: 'Admin User',
          email: 'admin@campus.com',
          password: 'password123',
          provider: 'local'
        });
        await seedUser.save();
      }

      const sampleEvents = [
        {
          title: 'OtakuFest 2025',
          description: 'The biggest anime event at UI with games, competitions, and movie night.',
          location: 'Trenchard Hall',
          date: new Date('2025-04-26'),
          time: '2:00 PM',
          category: 'Anime',
          createdBy: seedUser._id
        },
        {
          title: 'UI vs OAU Football Match',
          description: 'Inter-university football championship match between UI and OAU.',
          location: 'Sports Complex',
          date: new Date('2025-03-15'),
          time: '4:00 PM',
          category: 'Sports',
          createdBy: seedUser._id
        },
        {
          title: 'Spring Music Concert',
          description: 'Annual spring music concert featuring local and international artists.',
          location: 'University Auditorium',
          date: new Date('2025-05-10'),
          time: '7:00 PM',
          category: 'Music',
          createdBy: seedUser._id
        },
        {
          title: 'AI in Education Seminar',
          description: 'Academic seminar discussing the role of artificial intelligence in modern education.',
          location: 'Faculty of Science',
          date: new Date('2025-03-20'),
          time: '10:00 AM',
          category: 'Academic',
          createdBy: seedUser._id
        },
        {
          title: 'Campus Fellowship Service',
          description: 'Weekly campus fellowship service with worship and teachings.',
          location: 'Chapel',
          date: new Date('2025-03-16'),
          time: '6:00 PM',
          category: 'Religious',
          createdBy: seedUser._id
        }
      ];

      await Event.insertMany(sampleEvents);
      console.log('Database seeded with sample events');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});