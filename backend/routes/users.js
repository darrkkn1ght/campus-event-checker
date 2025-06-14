const express = require('express');
const auth = require('../middleware/auth');
const { getProfile, updateProfile, changePassword, getNotificationPreferences, updateNotificationPreferences, getThemePreference, updateThemePreference, getPrivacySettings, updatePrivacySettings } = require('../controllers/userController');

const router = express.Router();

router.get('/me', auth, getProfile);
router.patch('/me', auth, updateProfile);
router.patch('/me/password', auth, changePassword);
router.get('/me/notifications', auth, getNotificationPreferences);
router.patch('/me/notifications', auth, updateNotificationPreferences);
router.get('/me/theme', auth, getThemePreference);
router.patch('/me/theme', auth, updateThemePreference);
router.get('/me/privacy', auth, getPrivacySettings);
router.patch('/me/privacy', auth, updatePrivacySettings);

module.exports = router;