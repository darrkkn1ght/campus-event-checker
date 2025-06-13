import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../api';
import { LockClosedIcon, EnvelopeIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    // Handle OAuth success redirect
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      fetchUserProfile(token);
    }
  }, [location]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await authAPI.getProfile();
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (error) {
      setError('Authentication failed. Please try again.');
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.login(data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center mb-6">
          <span className="inline-flex items-center gap-2 text-3xl font-extrabold text-blue-600 select-none">
            <span className="inline-block">
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#3B82F6"/>
                <path d="M10 22L16 10L22 22H10Z" fill="#fff"/>
              </svg>
            </span>
            CampusEvents
          </span>
          <span className="mt-2 text-blue-400 font-medium text-base flex items-center gap-1">
            <SparklesIcon className="h-5 w-5 text-pink-400" /> Welcome back!
          </span>
        </div>
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-pink-500 transition"
          >
            create a new account
          </Link>
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-2">
              <ArrowLeftOnRectangleIcon className="h-5 w-5 text-red-400" />
              <p className="text-red-800">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-blue-300" />
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  {...register('email', { required: 'Email is required' })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-2.5 h-5 w-5 text-blue-300" />
                <input
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  {...register('password', { required: 'Password is required' })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-pink-500 transition">
                  Forgot your password?
                </Link>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Logging in...' : 'Sign in'}
              </button>
            </div>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-2">
              <button
                onClick={() => handleOAuthLogin('google')}
                className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all"
              >
                <svg className="h-5 w-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.36 1.53 7.82 2.81l5.77-5.62C33.64 3.61 29.36 1.5 24 1.5 14.82 1.5 6.98 7.5 3.69 15.44l6.91 5.36C12.06 15.09 17.56 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.43-4.74H24v9.24h12.42c-.54 2.91-2.18 5.38-4.66 7.04l7.18 5.59C43.98 37.09 46.1 31.27 46.1 24.5z"/><path fill="#FBBC05" d="M10.6 28.09c-1.09-3.22-1.09-6.7 0-9.92l-6.91-5.36C1.64 17.09 0 20.36 0 24c0 3.64 1.64 6.91 3.69 9.19l6.91-5.1z"/><path fill="#EA4335" d="M24 46.5c5.36 0 9.64-1.78 12.82-4.86l-7.18-5.59c-2.01 1.36-4.59 2.18-7.64 2.18-6.44 0-11.94-5.59-13.4-12.95l-6.91 5.1C6.98 40.5 14.82 46.5 24 46.5z"/></g></svg>
                Sign in with Google
              </button>
              <button
                onClick={() => handleOAuthLogin('facebook')}
                className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all"
              >
                <svg className="h-5 w-5" viewBox="0 0 48 48"><path fill="#1877F2" d="M24 1.5C11.85 1.5 1.5 11.85 1.5 24c0 11.05 8.7 20.13 19.5 21.36V30.75h-5.86v-6.75h5.86v-5.16c0-5.8 3.44-9 8.7-9 2.52 0 5.16.45 5.16.45v5.7h-2.91c-2.87 0-3.75 1.78-3.75 3.6v4.41h6.38l-1.02 6.75h-5.36v14.61C38.8 44.13 47.5 35.05 47.5 24c0-12.15-10.35-22.5-23.5-22.5z"/></svg>
                Sign in with Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
