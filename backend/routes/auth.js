const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const { register, login, oauthSuccess } = require('../controllers/authController');

const router = express.Router();

// Local authentication
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login` }),
  oauthSuccess
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: `${process.env.CLIENT_URL}/login` }),
  oauthSuccess
);

module.exports = router;