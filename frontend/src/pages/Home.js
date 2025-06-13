import React, { useState, useEffect } from 'react';
import { eventAPI } from '../api';
import EventCard from '../components/EventCard';
import { MagnifyingGlassIcon, FunnelIcon, SparklesIcon, UsersIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const testimonials = [
  {
    name: 'Jane Doe',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    quote: 'CampusEvents makes it so easy to find and join fun activities! I never miss out anymore.',
  },
  {
    name: 'John Smith',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    quote: 'The best way to discover what’s happening on campus. The event reminders are a lifesaver!',
  },
  {
    name: 'Priya Patel',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    quote: 'I love the clean design and how easy it is to RSVP to events. Highly recommended!',
  },
];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    date: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['Anime', 'Sports', 'Music', 'Academic', 'Religious', 'Social', 'Other'];

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.date) params.date = filters.date;

      const response = await eventAPI.getEvents(params);
      setEvents(response.data);
    } catch (error) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      date: ''
    });
  };

  const hasActiveFilters = filters.category || filters.location || filters.date;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-pink-400 py-20 px-4 sm:px-6 lg:px-8 shadow-lg rounded-b-3xl overflow-hidden">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <SparklesIcon className="h-12 w-12 text-white drop-shadow-lg animate-bounce" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            Discover Campus Events
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 mb-8 font-medium">
            Stay updated with the latest events happening at your campus
          </p>
          <a
            href="#events"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-full shadow hover:bg-blue-50 hover:scale-105 transition transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Explore Events
          </a>
        </div>
        <div className="absolute left-0 top-0 w-40 h-40 bg-pink-300 opacity-30 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute right-0 bottom-0 w-40 h-40 bg-blue-300 opacity-30 rounded-full blur-3xl -z-10 animate-pulse" />
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-blue-500" /> Filter Events
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 md:hidden"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Search by location"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-6" id="events">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
            {hasActiveFilters ? 'Filtered Events' : 'All Events'} <span className="text-blue-400">({events.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
            <span className="ml-4 text-blue-500 font-medium">Loading events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">
              {hasActiveFilters 
                ? 'Try adjusting your filters to find more events.'
                : 'There are no events available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Testimonials Section */}
      <div className="bg-white/80 py-16 px-4 sm:px-6 lg:px-8 mt-12 border-t border-blue-100">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <UsersIcon className="h-10 w-10 text-blue-500 mx-auto mb-2" />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">What Students Say</h2>
          <p className="text-lg text-gray-600">Hear from our happy campus community!</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center transition hover:shadow-lg">
              <img src={t.avatar} alt={t.name} className="h-16 w-16 rounded-full mb-4 border-2 border-blue-200 object-cover" />
              <p className="text-gray-700 italic mb-3">“{t.quote}”</p>
              <span className="font-semibold text-blue-600">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
