import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { authAPI } from '../api';

const NotificationPreferencesForm = ({ setError, setSuccess, setLoading, loading }) => {
  const { register, handleSubmit, setValue, reset } = useForm();

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const res = await authAPI.getNotificationPreferences();
        reset({
          eventReminders: !!res.data.eventReminders,
          newEvents: !!res.data.newEvents,
          rsvpConfirmations: !!res.data.rsvpConfirmations,
        });
      } catch (err) {
        setError('Failed to load notification preferences');
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
    // eslint-disable-next-line
  }, []);

  const onSubmit = async (data) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await authAPI.updateNotificationPreferences({
        eventReminders: !!data.eventReminders,
        newEvents: !!data.newEvents,
        rsvpConfirmations: !!data.rsvpConfirmations,
      });
      setSuccess('Notification preferences updated!');
    } catch (err) {
      setError('Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="max-w-md mx-auto space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="flex items-center gap-3">
          <input type="checkbox" {...register('eventReminders')} />
          Event Reminders
        </label>
      </div>
      <div>
        <label className="flex items-center gap-3">
          <input type="checkbox" {...register('newEvents')} />
          New Events
        </label>
      </div>
      <div>
        <label className="flex items-center gap-3">
          <input type="checkbox" {...register('rsvpConfirmations')} />
          RSVP Confirmations
        </label>
      </div>
      <div className="flex items-center justify-end pt-6">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );
};

export default NotificationPreferencesForm;
