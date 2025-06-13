import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventAPI } from '../api';
import {
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
  TagIcon,
  UserCircleIcon,
  ArrowUturnLeftIcon,
  UserPlusIcon,
  ShareIcon,
  PlusCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedEvents, setRelatedEvents] = useState([]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventAPI.getEvent(id);
        setEvent(response.data);
        // Fetch related events (same category, exclude current)
        const rel = await eventAPI.getEvents({ category: response.data.category });
        setRelatedEvents(rel.data.filter(e => e._id !== id).slice(0, 3));
      } catch (error) {
        setError('Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-blue-500 font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="h-16 w-16 text-pink-400 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold">{error}</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline font-medium">
            <ArrowUturnLeftIcon className="h-5 w-5 inline mr-1" /> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-10 px-2">
      <div className="max-w-3xl mx-auto">
        {/* Event Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-300" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <CalendarDaysIcon className="h-8 w-8 text-blue-400" /> {event.title}
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shadow-sm bg-blue-50 text-blue-700">
              <TagIcon className="w-5 h-5 mr-1" /> {event.category}
            </span>
          </div>
          <p className="text-gray-700 text-lg mb-6">{event.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-center text-gray-600 text-base">
                <CalendarDaysIcon className="h-6 w-6 mr-2 text-blue-400" />
                {formatDate(event.date)}
              </div>
              <div className="flex items-center text-gray-600 text-base">
                <ClockIcon className="h-6 w-6 mr-2 text-pink-400" />
                {event.time}
              </div>
              <div className="flex items-center text-gray-600 text-base">
                <MapPinIcon className="h-6 w-6 mr-2 text-yellow-400" />
                {event.location}
              </div>
            </div>
            {/* Organizer Info */}
            <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-4">
              <img
                src={event.createdBy?.avatarUrl || `https://ui-avatars.com/api/?name=${event.createdBy?.name || 'Organizer'}`}
                alt={event.createdBy?.name || 'Organizer'}
                className="h-14 w-14 rounded-full border-2 border-blue-200 object-cover"
              />
              <div>
                <div className="font-semibold text-blue-700 flex items-center gap-1">
                  <UserCircleIcon className="h-5 w-5" /> {event.createdBy?.name || 'Organizer'}
                </div>
                <div className="text-xs text-gray-500">Organizer</div>
              </div>
            </div>
          </div>
          {/* Map/Location Section */}
          <div className="mb-8">
            <div className="rounded-xl overflow-hidden shadow border border-blue-100">
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(event.location)}&zoom=15&size=600x200&key=YOUR_GOOGLE_MAPS_API_KEY`}
                alt={`Map of ${event.location}`}
                className="w-full h-48 object-cover"
                onError={e => { e.target.src = 'https://placehold.co/600x200?text=Map+Unavailable'; }}
              />
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-4">
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300">
              <UserPlusIcon className="h-5 w-5" /> RSVP
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-pink-500 text-white font-semibold shadow hover:bg-pink-600 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300">
              <ShareIcon className="h-5 w-5" /> Share
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-400 text-white font-semibold shadow hover:bg-yellow-500 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-300">
              <PlusCircleIcon className="h-5 w-5" /> Add to Calendar
            </button>
          </div>
          <Link to="/" className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium mt-2">
            <ArrowUturnLeftIcon className="h-5 w-5" /> Back to Events
          </Link>
        </div>

        {/* Related/Upcoming Events */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-pink-400" /> Related Events
          </h2>
          {relatedEvents.length === 0 ? (
            <div className="text-gray-500 italic">No related events found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedEvents.map(ev => (
                <Link to={`/events/${ev._id}`} key={ev._id} className="block bg-white rounded-xl shadow hover:shadow-lg transition p-5 border border-blue-50">
                  <div className="flex items-center gap-3 mb-2">
                    <CalendarDaysIcon className="h-5 w-5 text-blue-400" />
                    <span className="font-semibold text-gray-900">{ev.title}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1 line-clamp-2">{ev.description}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ClockIcon className="h-4 w-4" /> {ev.time}
                    <MapPinIcon className="h-4 w-4" /> {ev.location}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
