import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, MapPinIcon, ClockIcon, TagIcon, ArrowRightCircleIcon } from '@heroicons/react/24/outline';

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Anime': 'bg-purple-100 text-purple-700',
      'Sports': 'bg-green-100 text-green-700',
      'Music': 'bg-pink-100 text-pink-700',
      'Academic': 'bg-blue-100 text-blue-700',
      'Religious': 'bg-yellow-100 text-yellow-700',
      'Social': 'bg-indigo-100 text-indigo-700',
      'Other': 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-blue-50 hover:scale-[1.025]">
      {/* Gradient Accent Bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-300" />
      {/* Event Image */}
      <div className="w-full h-40 bg-gray-100 overflow-hidden flex items-center justify-center">
        <img
          src={event.image || `https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80`}
          alt={event.title + ' event banner'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
            {event.title}
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm ${getCategoryColor(event.category)}`}>
            <TagIcon className="w-4 h-4 mr-1" />
            {event.category}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{event.description}</p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarDaysIcon className="w-5 h-5 mr-2 text-blue-400" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="w-5 h-5 mr-2 text-pink-400" />
            {event.time}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="w-5 h-5 mr-2 text-yellow-400" />
            {event.location}
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="text-xs text-gray-400 italic">
            By {event.createdBy?.name || 'Unknown'}
          </div>
          <Link
            to={`/events/${event._id}`}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-blue-500 text-white font-semibold text-sm shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
            aria-label={`View details for ${event.title}`}
          >
            View Details <ArrowRightCircleIcon className="w-5 h-5 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
