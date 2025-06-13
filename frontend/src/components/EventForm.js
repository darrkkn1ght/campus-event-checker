import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { eventAPI } from '../api';

const EventForm = ({ isEdit = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

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
    } catch (error) {
      setError('Failed to fetch event details');
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      if (isEdit) {
        await eventAPI.updateEvent(id, data);
      } else {
        await eventAPI.createEvent(data);
      }

      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save event');
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Anime', 'Sports', 'Music', 'Academic', 'Religious', 'Social', 'Other'];

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {isEdit ? 'Edit Event' : 'Create New Event'}
          </h2>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Event Title
              </label>
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="Describe your event"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  {...register('date', { required: 'Date is required' })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="text"
                  id="time"
                  {...register('time', { required: 'Time is required' })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  placeholder="e.g., 2:00 PM"
                />
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
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  placeholder="Event location"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  {...register('category', { required: 'Category is required' })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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