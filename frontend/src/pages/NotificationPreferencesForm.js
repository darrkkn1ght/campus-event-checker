import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const NotificationPreferencesForm = React.memo(({ setError, setSuccess, setLoading, loading, preferences, onPreferencesUpdated }) => {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (preferences) {
      reset({
        eventReminders: !!preferences.eventReminders,
        newEvents: !!preferences.newEvents,
        rsvpConfirmations: !!preferences.rsvpConfirmations,
      });
    }
  }, [preferences, reset]);

  const onSubmit = async (data) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      const res = await fetch(
        '/api/users/me/notifications',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            eventReminders: !!data.eventReminders,
            newEvents: !!data.newEvents,
            rsvpConfirmations: !!data.rsvpConfirmations,
          }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setSuccess('Notification preferences updated!');
        if (onPreferencesUpdated) onPreferencesUpdated(updated);
      } else {
        setError('Failed to update notification preferences');
      }
    } catch (err) {
      setError('Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  if (!preferences) {
    return (
      <div className="flex justify-center items-center min-h-[150px]">
        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="ml-3 text-blue-500">Loading preferences...</span>
      </div>
    );
  }

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
});

export default NotificationPreferencesForm;
