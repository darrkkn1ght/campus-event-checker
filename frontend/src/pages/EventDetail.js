import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventAPI } from '../api';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventAPI.getEvent(id);
        setEvent(response.data);
      } catch (error) {
        setError('Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
      <p className="text-gray-700 mb-4">{event.description}</p>
      <p className="text-gray-600 mb-2">
        <strong>Location:</strong> {event.location}
      </p>
      <p className="text-gray-600 mb-2">
        <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
      </p>
      <p className="text-gray-600 mb-2">
        <strong>Time:</strong> {event.time}
      </p>
      <p className="text-gray-600 mb-2">
        <strong>Category:</strong> {event.category}
      </p>
      <Link to="/" className="text-primary hover:underline">
        Back to Events
      </Link>
    </div>
  );
};

export default EventDetail;
