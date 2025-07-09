import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, eventAPI } from '../api';
import { UserCircleIcon, EnvelopeIcon, CalendarDaysIcon, PlusCircleIcon, ArrowRightCircleIcon, SparklesIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon, UsersIcon, ChartBarIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        setUser(response.data);
      } catch (error) {
        setError('Failed to fetch user profile');
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user) return;
      try {
        const response = await eventAPI.getEvents({ createdBy: user._id });
        setEvents(response.data);
      } catch (error) {
        setError('Failed to fetch user events');
      } finally {
        setLoading(false);
      }
    };
    fetchUserEvents();
  }, [user]);

  const handleCancelEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel this event? This will notify all attendees and refund paid tickets.')) return;
    setActionMessage('');
    try {
      const response = await eventAPI.cancelEvent(eventId);
      setActionMessage(response.data.message || 'Event cancelled.');
      setEvents(events.map(e => e._id === eventId ? { ...e, cancelled: true } : e));
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to cancel event.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse rounded-full h-24 w-24 bg-blue-200 mx-auto mb-4" />
          <p className="mt-4 text-blue-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-10 px-2">
      <div className="max-w-5xl mx-auto">
        {/* Greeting */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-8 w-8 text-pink-400" />
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome, {user?.name}!</h1>
          </div>
          <button
            onClick={() => navigate('/create-event')}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-pink-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <PlusCircleIcon className="h-5 w-5" /> Create New Event
          </button>
        </div>
        {/* Organizer's Events */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="h-6 w-6 text-blue-400" /> My Events
          </h2>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <ArrowRightCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600">Create your first event to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.map(event => (
                <div key={event._id} className="bg-white rounded-xl shadow p-6 flex flex-col gap-3 border border-blue-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-blue-700">{event.title}</span>
                    {event.cancelled && <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded text-xs">Cancelled</span>}
                  </div>
                  <div className="text-gray-600 text-sm mb-1">{new Date(event.date).toLocaleString()} @ {event.location}</div>
                  <div className="text-xs text-gray-500 mb-1">Category: {event.category}</div>
                  <div className="text-xs text-gray-500 mb-1">{event.isPaid ? `₦${event.price}` : 'Free'} | {typeof event.remainingTickets === 'number' ? (event.remainingTickets === 0 ? 'Full' : `${event.remainingTickets} left`) : ''}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Link to={`/events/${event._id}/attendees`} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-100 text-blue-700 font-medium text-xs hover:bg-blue-200 transition"><UsersIcon className="h-4 w-4" /> Attendees</Link>
                    <Link to={`/events/${event._id}/analytics`} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-green-100 text-green-700 font-medium text-xs hover:bg-green-200 transition"><ChartBarIcon className="h-4 w-4" /> Analytics</Link>
                    <Link to={`/edit-event/${event._id}`} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-yellow-100 text-yellow-700 font-medium text-xs hover:bg-yellow-200 transition"><PencilSquareIcon className="h-4 w-4" /> Edit</Link>
                    {!event.cancelled && <button onClick={() => handleCancelEvent(event._id)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-100 text-red-700 font-medium text-xs hover:bg-red-200 transition"><TrashIcon className="h-4 w-4" /> Cancel</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {actionMessage && <div className="my-4 text-center text-blue-700 font-semibold">{actionMessage}</div>}
      </div>
    </div>
  );
};

export default Dashboard;
