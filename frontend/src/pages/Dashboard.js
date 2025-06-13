import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, eventAPI } from '../api';
import { UserCircleIcon, EnvelopeIcon, CalendarDaysIcon, PlusCircleIcon, ArrowRightCircleIcon, SparklesIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import EventCard from '../components/EventCard';

const getGreeting = (name) => {
  const hour = new Date().getHours();
  let greeting = 'Hello';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  return `${greeting}, ${name}!`;
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  // Stats
  const now = new Date();
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => new Date(e.date) >= now).length;
  const pastEvents = events.filter(e => new Date(e.date) < now).length;

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
            <h1 className="text-3xl font-extrabold text-gray-900">{getGreeting(user.name)}</h1>
          </div>
          <button
            onClick={() => navigate('/create-event')}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-pink-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <PlusCircleIcon className="h-5 w-5" /> Create New Event
          </button>
        </div>
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row items-center gap-6 mb-10">
          <img
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
            alt={user.name}
            className="h-20 w-20 rounded-full border-2 border-blue-200 object-cover shadow"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <UserCircleIcon className="h-6 w-6 text-blue-400" />
              <span className="font-bold text-lg text-gray-900">{user.name}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <EnvelopeIcon className="h-5 w-5 text-pink-400" />
              <span className="text-gray-700">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-yellow-400" />
              <span className="text-gray-500 text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-blue-50 rounded-xl p-6 flex flex-col items-center shadow">
            <span className="text-3xl font-extrabold text-blue-600">{totalEvents}</span>
            <span className="mt-2 text-gray-700 font-medium flex items-center gap-1">
              <CalendarDaysIcon className="h-5 w-5 text-blue-400" /> Total Events
            </span>
          </div>
          <div className="bg-pink-50 rounded-xl p-6 flex flex-col items-center shadow">
            <span className="text-3xl font-extrabold text-pink-500">{upcomingEvents}</span>
            <span className="mt-2 text-gray-700 font-medium flex items-center gap-1">
              <ClockIcon className="h-5 w-5 text-pink-400" /> Upcoming
            </span>
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 flex flex-col items-center shadow">
            <span className="text-3xl font-extrabold text-yellow-500">{pastEvents}</span>
            <span className="mt-2 text-gray-700 font-medium flex items-center gap-1">
              <CheckCircleIcon className="h-5 w-5 text-yellow-400" /> Past
            </span>
          </div>
        </div>
        {/* User's Events */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="h-6 w-6 text-blue-400" /> Your Events
          </h2>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <ArrowRightCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600">Create your first event to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
