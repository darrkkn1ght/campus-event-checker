import React, { useEffect, useState } from 'react';
import { authAPI, eventAPI } from '../api';

const Dashboard = () => {
  const [user, setUser ] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile</h2>
      <p className="text-gray-700 mb-2"><strong>Name:</strong> {user.name}</p>
      <p className="text-gray-700 mb-2"><strong>Email:</strong> {user.email}</p>

      <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Your Events</h2>
      {events.length === 0 ? (
        <p className="text-gray-600">You have not created any events yet.</p>
      ) : (
        <ul className="list-disc pl-5">
          {events.map(event => (
            <li key={event._id} className="text-gray-700 mb-2">
              <a href={`/events/${event._id}`} className="text-primary hover:underline">
                {event.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
