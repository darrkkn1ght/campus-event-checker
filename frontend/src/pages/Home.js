import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI } from '../api';
import { MagnifyingGlassIcon, FunnelIcon, SparklesIcon, UsersIcon, CalendarDaysIcon, CalendarIcon, ClockIcon, MapPinIcon, UserIcon, StarIcon, FireIcon, TicketIcon, TagIcon } from '@heroicons/react/24/outline';

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

const categories = ['Anime', 'Sports', 'Music', 'Academic', 'Religious', 'Social', 'Other', 'Workshop', 'Entertainment', 'Career'];

const categoryColors = {
  Anime: 'bg-pink-100 text-pink-600 border-pink-300',
  Sports: 'bg-green-100 text-green-600 border-green-300',
  Music: 'bg-purple-100 text-purple-600 border-purple-300',
  Academic: 'bg-blue-100 text-blue-600 border-blue-300',
  Religious: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Social: 'bg-orange-100 text-orange-600 border-orange-300',
  Workshop: 'bg-indigo-100 text-indigo-600 border-indigo-300',
  Entertainment: 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-300',
  Career: 'bg-teal-100 text-teal-600 border-teal-300',
  Other: 'bg-gray-100 text-gray-600 border-gray-300',
};

const categoryImages = {
  Anime: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  Sports: 'https://images.unsplash.com/photo-1505843279827-4b2b0c44a0a0?auto=format&fit=crop&w=600&q=80',
  Music: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
  Academic: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=600&q=80',
  Religious: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  Social: 'https://images.unsplash.com/photo-1515168833906-d2a3b82b3029?auto=format&fit=crop&w=600&q=80',
  Workshop: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
  Entertainment: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
  Career: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80',
  Study: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=600&q=80', // fallback for study
  StudyGroup: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80', // new: group of students studying
  'Study Group': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80', // new: group of students studying
  Other: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80',
};

const gradientBorders = [
  'from-pink-400 to-yellow-300',
  'from-blue-400 to-pink-400',
  'from-green-400 to-blue-400',
  'from-purple-400 to-pink-400',
  'from-yellow-400 to-orange-400',
  'from-gray-400 to-blue-400',
];

const organizerAvatars = [
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/men/13.jpg',
  'https://randomuser.me/api/portraits/women/14.jpg',
  'https://randomuser.me/api/portraits/men/15.jpg',
  'https://randomuser.me/api/portraits/women/16.jpg',
];

const getAvatar = (name) => {
  if (!name) return organizerAvatars[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return organizerAvatars[hash % organizerAvatars.length];
};

const getCategoryImage = (category, fallback) => {
  return categoryImages[category] || fallback || categoryImages.Other;
};

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ category: '', location: '', date: '' });
  const [showFilters, setShowFilters] = useState(false);

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
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', location: '', date: '' });
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
            <CalendarDaysIcon className="h-6 w-6 text-blue-400" />
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
            {events.map((event, idx) => {
              const catColor = categoryColors[event.category] || categoryColors.Other;
              const borderGradient = gradientBorders[idx % gradientBorders.length];
              const isFull = event.remainingTickets === 0;
              const isFree = !event.isPaid || event.price === 0;
              const isFeatured = event.isFeatured;
              const isPopular = event.isPopular;
              const eventImage = event.image || getCategoryImage(event.category, `https://source.unsplash.com/600x300/?${encodeURIComponent(event.category || 'campus')}`);
              const organizerAvatar = getAvatar(event.organizerName);
              return (
                <div
                  key={event._id}
                  className={`relative bg-gradient-to-br from-white via-blue-50 to-pink-50 rounded-2xl shadow-lg p-0 pt-0 transition hover:scale-[1.025] hover:shadow-2xl border border-gray-100 group focus-within:ring-2 focus-within:ring-blue-400`}
                  tabIndex={0}
                  aria-label={`Event: ${event.title}`}
                  style={{
                    boxShadow: '0 4px 24px 0 rgba(80, 112, 255, 0.07)',
                  }}
                >
                  {/* Gradient border top */}
                  <div className={`absolute -top-1 left-4 right-4 h-2 rounded-t-xl bg-gradient-to-r ${borderGradient} animate-pulse`} />
                  {/* Featured/Popular Ribbon */}
                  {isFeatured && (
                    <span className="absolute left-4 top-4 bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-bounce z-10">
                      <StarIcon className="w-4 h-4" /> Featured
                    </span>
                  )}
                  {isPopular && !isFeatured && (
                    <span className="absolute left-4 top-4 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse z-10">
                      <FireIcon className="w-4 h-4" /> Popular
                    </span>
                  )}
                  {/* Event Image with overlay */}
                  <div className="relative w-full h-36 rounded-t-2xl overflow-hidden mb-2">
                    <img
                      src={eventImage}
                      alt={event.title + ' event banner'}
                      className="w-full h-full object-cover rounded-t-2xl"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent rounded-t-2xl" aria-hidden="true" />
                    {/* Price/Status Badge - top left */}
                    <span className={`absolute left-3 top-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 z-10 ${isFull ? 'bg-red-100 text-red-600 border-red-300' : isFree ? 'bg-green-100 text-green-700 border-green-300' : 'bg-blue-100 text-blue-700 border-blue-300'}`}
                      aria-label={isFull ? 'Full' : isFree ? 'Free' : `₦${event.price}`}
                    >
                      {isFull ? 'Full' : isFree ? 'Free' : `₦${event.price}`}
                    </span>
                    {/* Category Tag (animated, with icon) - top right */}
                    <span className={`absolute right-3 top-3 px-3 py-1 rounded-full text-xs font-semibold border ${catColor} shadow-sm flex items-center gap-1 animate-fadeIn`}> <TagIcon className="w-4 h-4" /> {event.category}</span>
                  </div>
                  {/* Card Content */}
                  <div className="p-6 pt-2">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1 pr-28 line-clamp-1" title={event.title}>{event.title}</h3>
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[40px]">{event.description}</p>
                    {/* Event Details */}
                    <div className="flex items-center text-sm text-gray-500 mb-1 gap-3 flex-wrap">
                      <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" />{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" />{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" />{event.location}</span>
                    </div>
                    {/* Remaining Tickets/Capacity */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isFull ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}
                        aria-label={isFull ? 'No tickets left' : `${event.remainingTickets || 0} tickets left`}
                      >
                        <TicketIcon className="w-4 h-4" />
                        {isFull ? 'Sold Out' : `${event.remainingTickets || 0} left`}
                      </span>
                    </div>
                    {/* Organizer */}
                    <div className="text-xs text-gray-400 mb-4 flex items-center gap-2">
                      <img
                        src={organizerAvatar}
                        alt={event.organizerName ? `${event.organizerName} avatar` : 'Organizer avatar'}
                        className="w-6 h-6 rounded-full border-2 border-blue-100 object-cover"
                        loading="lazy"
                      />
                      <UserIcon className="w-4 h-4" /> By {event.organizerName || 'Admin User'}
                    </div>
                    {/* View Details Button */}
                    <Link
                      to={`/events/${event._id}`}
                      className="inline-flex items-center px-5 py-2 bg-blue-500 text-white font-semibold rounded-full shadow hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                      tabIndex={0}
                      aria-label={`View details for ${event.title}`}
                    >
                      View Details <span className="ml-2"> <MagnifyingGlassIcon className="w-4 h-4" /> </span>
                    </Link>
                  </div>
                </div>
              );
            })}
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
