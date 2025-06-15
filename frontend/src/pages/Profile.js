import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { authAPI } from '../api';
import {
  UserCircleIcon, EnvelopeIcon, CalendarDaysIcon, PencilSquareIcon, ArrowLeftIcon, SparklesIcon, KeyIcon, BellIcon, MoonIcon, EyeIcon, LinkIcon, GlobeAltIcon, ArrowDownTrayIcon, DevicePhoneMobileIcon, AdjustmentsHorizontalIcon, TrashIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import NotificationPreferencesForm from './NotificationPreferencesForm';

const SETTINGS_TABS = [
  { key: 'profile', label: 'Profile', icon: UserCircleIcon },
  { key: 'password', label: 'Password', icon: KeyIcon },
  { key: 'notifications', label: 'Notifications', icon: BellIcon },
  { key: 'theme', label: 'Theme', icon: MoonIcon },
  { key: 'privacy', label: 'Privacy', icon: EyeIcon },
  { key: 'accounts', label: 'Connected Accounts', icon: LinkIcon },
  { key: 'language', label: 'Language', icon: GlobeAltIcon },
  { key: 'download', label: 'Download Data', icon: ArrowDownTrayIcon },
  { key: 'sessions', label: 'Sessions', icon: DevicePhoneMobileIcon },
  { key: 'accessibility', label: 'Accessibility', icon: AdjustmentsHorizontalIcon },
  { key: 'delete', label: 'Delete Account', icon: TrashIcon },
];

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationPreferences, setNotificationPreferences] = useState(null);
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'notifications' && notificationPreferences === null) {
      fetchNotificationPreferences();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setUser(response.data);
      setValue('name', response.data.name);
      setValue('avatarUrl', response.data.avatarUrl || '');
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch profile');
      setLoading(false);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getNotificationPreferences();
      setNotificationPreferences({
        eventReminders: !!res.data.eventReminders,
        newEvents: !!res.data.newEvents,
        rsvpConfirmations: !!res.data.rsvpConfirmations,
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load notification preferences');
      setLoading(false);
    }
  };

  // Placeholder for tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <div className="flex flex-col items-center mb-8">
              <img
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
                alt={user.name}
                className="h-24 w-24 rounded-full border-2 border-blue-200 object-cover shadow mb-2"
              />
              <div className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <UserCircleIcon className="h-5 w-5 text-blue-400" /> {user.name}
              </div>
              <div className="text-gray-700 flex items-center gap-2">
                <EnvelopeIcon className="h-5 w-5 text-pink-400" /> {user.email}
              </div>
              <div className="text-gray-500 text-sm flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-yellow-400" /> Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
            {editMode ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <div className="relative">
                    <PencilSquareIcon className="absolute left-3 top-2.5 h-5 w-5 text-blue-300" />
                    <input
                      type="text"
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                  <div className="relative">
                    <UserCircleIcon className="absolute left-3 top-2.5 h-5 w-5 text-blue-300" />
                    <input
                      type="text"
                      id="avatarUrl"
                      {...register('avatarUrl')}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => { setEditMode(false); reset({ name: user.name, avatarUrl: user.avatarUrl || '' }); setError(''); setSuccess(''); }}
                    className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-pink-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <PencilSquareIcon className="h-5 w-5" /> Edit Profile
                </button>
              </div>
            )}
          </div>
        );
      case 'password':
        return (
          <form className="max-w-md mx-auto space-y-6" onSubmit={handleSubmit(async (data) => {
            setError('');
            setSuccess('');
            if (data.newPassword !== data.confirmPassword) {
              setError('New passwords do not match');
              return;
            }
            try {
              setLoading(true);
              await authAPI.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
              });
              setSuccess('Password changed successfully!');
              reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } catch (err) {
              setError(err.response?.data?.message || 'Failed to change password');
            } finally {
              setLoading(false);
            }
          })}>
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                {...register('currentPassword', { required: 'Current password is required' })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>}
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                id="newPassword"
                {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                {...register('confirmPassword', { required: 'Please confirm your new password' })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>
            <div className="flex items-center justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        );
      case 'notifications':
        return (
          <NotificationPreferencesForm
            setError={setError}
            setSuccess={setSuccess}
            setLoading={setLoading}
            loading={loading}
            preferences={notificationPreferences}
            onPreferencesUpdated={updated => setNotificationPreferences(updated)}
          />
        );
      case 'theme':
        return <div className="text-gray-500">Theme/appearance (coming soon)</div>;
      case 'privacy':
        return <div className="text-gray-500">Privacy settings (coming soon)</div>;
      case 'accounts':
        return <div className="text-gray-500">Connected accounts (coming soon)</div>;
      case 'language':
        return <div className="text-gray-500">Language/locale (coming soon)</div>;
      case 'download':
        return <div className="text-gray-500">Download my data (coming soon)</div>;
      case 'sessions':
        return <div className="text-gray-500">Session management (coming soon)</div>;
      case 'accessibility':
        return <div className="text-gray-500">Accessibility options (coming soon)</div>;
      case 'delete':
        return <div className="text-red-500">Delete account (coming soon)</div>;
      default:
        return null;
    }
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await authAPI.updateProfile(data);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse rounded-full h-24 w-24 bg-blue-200 mx-auto mb-4" />
          <p className="mt-4 text-blue-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-10 px-2">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SparklesIcon className="h-8 w-8 text-pink-400" />
          <h1 className="text-3xl font-extrabold text-gray-900">Settings</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row">
          {/* Settings Navigation */}
          <nav className="md:w-1/4 border-b md:border-b-0 md:border-r border-gray-100 p-4 flex md:flex-col gap-2 md:gap-1 overflow-x-auto">
            {SETTINGS_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setEditMode(false); setError(''); setSuccess(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 w-full md:w-auto whitespace-nowrap
                  ${activeTab === tab.key ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
              >
                <tab.icon className="h-5 w-5" /> {tab.label}
              </button>
            ))}
          </nav>
          {/* Settings Content */}
          <div className="flex-1 p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-2">
                <ArrowLeftIcon className="h-5 w-5 text-red-400" />
                <p className="text-red-800">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 text-green-800">
                {success}
              </div>
            )}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
