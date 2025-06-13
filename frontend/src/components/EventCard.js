import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, MapPinIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline';

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
      'Anime': 'bg-purple-100 text-purple-800',
      'Sports': 'bg-green-100 text-green-800',
      'Music': 'bg-pink-100 text-pink-800',
      'Academic': 'bg-blue-100 text-blue-800',
      'Religious': 'bg-yellow-100 text-yellow-800',
      'Social': 'bg-indigo-100 text-indigo-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
            <TagIcon className="w-3 h-3 mr-1" />
            {event.category}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarDaysIcon className="w-4 h-4 mr-2" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="w-4 h-4 mr-2" />
            {event.time}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="w-4 h-4 mr-2" />
            {event.location}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            By {event.createdBy?.name || 'Unknown'}
          </div>
          <Link
            to={`/events/${event._id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;