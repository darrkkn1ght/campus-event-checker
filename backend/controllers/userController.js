const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.avatarUrl) updates.avatarUrl = req.body.avatarUrl;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.provider !== 'local') {
      return res.status(400).json({ message: 'Password change is only available for local accounts' });
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

const getNotificationPreferences = async (req, res) => {
  const start = Date.now();
  try {
    console.log('[NotificationPreferences] Start fetching for user:', req.user._id);
    const dbStart = Date.now();
    const user = await User.findById(req.user._id).select('notificationPreferences');
    const dbEnd = Date.now();
    console.log(`[NotificationPreferences] DB query took ${dbEnd - dbStart}ms`);
    const prefs = user.notificationPreferences || {};
    res.json({
      eventReminders: typeof prefs.eventReminders === 'boolean' ? prefs.eventReminders : true,
      newEvents: typeof prefs.newEvents === 'boolean' ? prefs.newEvents : true,
      rsvpConfirmations: typeof prefs.rsvpConfirmations === 'boolean' ? prefs.rsvpConfirmations : true
    });
    const end = Date.now();
    console.log(`[NotificationPreferences] Total time: ${end - start}ms`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch notification preferences' });
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const { eventReminders, newEvents, rsvpConfirmations } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.notificationPreferences = {
      eventReminders: typeof eventReminders === 'boolean' ? eventReminders : user.notificationPreferences.eventReminders,
      newEvents: typeof newEvents === 'boolean' ? newEvents : user.notificationPreferences.newEvents,
      rsvpConfirmations: typeof rsvpConfirmations === 'boolean' ? rsvpConfirmations : user.notificationPreferences.rsvpConfirmations
    };
    await user.save();
    res.json(user.notificationPreferences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update notification preferences' });
  }
};

const getThemePreference = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('themePreference');
    res.json({ themePreference: user.themePreference || 'system' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch theme preference' });
  }
};

const updateThemePreference = async (req, res) => {
  try {
    const { themePreference } = req.body;
    if (!['light', 'dark', 'system'].includes(themePreference)) {
      return res.status(400).json({ message: 'Invalid theme preference' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.themePreference = themePreference;
    await user.save();
    res.json({ themePreference: user.themePreference });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update theme preference' });
  }
};

const getPrivacySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('privacy');
    res.json(user.privacy || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch privacy settings' });
  }
};

const updatePrivacySettings = async (req, res) => {
  try {
    const { profilePublic, eventsPublic, hideEmail, hideAvatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.privacy = {
      profilePublic: typeof profilePublic === 'boolean' ? profilePublic : user.privacy.profilePublic,
      eventsPublic: typeof eventsPublic === 'boolean' ? eventsPublic : user.privacy.eventsPublic,
      hideEmail: typeof hideEmail === 'boolean' ? hideEmail : user.privacy.hideEmail,
      hideAvatar: typeof hideAvatar === 'boolean' ? hideAvatar : user.privacy.hideAvatar
    };
    await user.save();
    res.json(user.privacy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update privacy settings' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getNotificationPreferences,
  updateNotificationPreferences,
  getThemePreference,
  updateThemePreference,
  getPrivacySettings,
  updatePrivacySettings
};