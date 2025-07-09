import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { eventAPI } from '../api';
import { CalendarDaysIcon, ClockIcon, MapPinIcon, TagIcon, PencilSquareIcon, SparklesIcon, ArrowLeftIcon, CurrencyDollarIcon, PhotoIcon, UsersIcon } from '@heroicons/react/24/outline';

const EventForm = ({ isEdit = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const [isPaid, setIsPaid] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm();

  useEffect(() => {
    if (isEdit && id) {
      fetchEvent();
    }
  }, [isEdit, id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getEvent(id);
      const event = response.data;
      // Format date for input
      const date = new Date(event.date);
      const formattedDate = date.toISOString().split('T')[0];
      setValue('title', event.title);
      setValue('description', event.description);
      setValue('location', event.location);
      setValue('date', formattedDate);
      setValue('time', event.time);
      setValue('category', event.category);
      setIsPaid(event.isPaid || false);
      setValue('price', event.price || '');
      setValue('image', event.image || '');
      setValue('ticketsAvailable', event.ticketsAvailable || '');
    } catch (error) {
      setError('Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      const eventData = {
        ...data,
        isPaid,
        price: isPaid ? Number(data.price) : 0,
        image: data.image,
        ticketsAvailable: data.ticketsAvailable ? Number(data.ticketsAvailable) : null,
      };
      if (isEdit) {
        await eventAPI.updateEvent(id, eventData);
      } else {
        await eventAPI.createEvent(eventData);
      }
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Anime', 'Sports', 'Music', 'Academic', 'Religious', 'Social', 'Other'];

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-blue-500 font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <SparklesIcon className="h-8 w-8 text-pink-400" />
            <h2 className="text-3xl font-extrabold text-gray-900">
              {isEdit ? 'Edit Event' : 'Create New Event'}
            </h2>
          </div>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-2">
              <ArrowLeftIcon className="h-5 w-5 text-red-400" />
              <p className="text-red-800">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Event Title
              </label>
              <div className="relative">
                <PencilSquareIcon className="absolute left-3 top-2.5 h-5 w-5 text-blue-300" />
                <input
                  type="text"
                  id="title"
                  {...register('title', {
                    required: 'Title is required',
                    minLength: {
                      value: 3,
                      message: 'Title must be at least 3 characters'
                    }
                  })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event title"
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <PencilSquareIcon className="absolute left-3 top-2.5 h-5 w-5 text-blue-300" />
                <textarea
                  id="description"
                  rows={4}
                  {...register('description', {
                    required: 'Description is required',
                    minLength: {
                      value: 10,
                      message: 'Description must be at least 10 characters'
                    }
                  })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your event"
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <CalendarDaysIcon className="absolute left-3 top-2.5 h-5 w-5 text-blue-300" />
                  <input
                    type="date"
                    id="date"
                    {...register('date', { required: 'Date is required' })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-3 top-2.5 h-5 w-5 text-pink-300" />
                  <input
                    type="text"
                    id="time"
                    {...register('time', { required: 'Time is required' })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-400 focus:border-pink-400"
                    placeholder="e.g., 2:00 PM"
                  />
                </div>
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-yellow-300" />
                  <input
                    type="text"
                    id="location"
                    {...register('location', {
                      required: 'Location is required',
                      minLength: {
                        value: 3,
                        message: 'Location must be at least 3 characters'
                      }
                    })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400"
                    placeholder="Event location"
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <TagIcon className="absolute left-3 top-2.5 h-5 w-5 text-indigo-300" />
                  <select
                    id="category"
                    {...register('category', { required: 'Category is required' })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-400 focus:border-indigo-400"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={e => setIsPaid(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Paid Event?</span>
              </label>
              {isPaid && (
                <div className="flex-1">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Ticket Price (₦)</label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-green-400" />
                    <input
                      type="number"
                      id="price"
                      {...register('price', {
                        required: isPaid ? 'Price is required for paid events' : false,
                        min: { value: 0, message: 'Price must be at least 0' }
                      })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400"
                      placeholder="Enter ticket price"
                    />
                  </div>
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="ticketsAvailable" className="block text-sm font-medium text-gray-700 mb-2">Number of Tickets Available</label>
              <div className="relative">
                <UsersIcon className="absolute left-3 top-2.5 h-5 w-5 text-blue-300" />
                <input
                  type="number"
                  id="ticketsAvailable"
                  {...register('ticketsAvailable', { min: { value: 1, message: 'Must be at least 1' } })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400"
                  placeholder="e.g., 100"
                />
              </div>
              {errors.ticketsAvailable && <p className="mt-1 text-sm text-red-600">{errors.ticketsAvailable.message}</p>}
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">Event Image URL</label>
              <div className="relative">
                <PhotoIcon className="absolute left-3 top-2.5 h-5 w-5 text-pink-300" />
                <input
                  type="text"
                  id="image"
                  {...register('image')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-400 focus:border-pink-400"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Event' : 'Create Event')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
