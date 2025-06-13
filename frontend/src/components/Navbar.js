import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserCircleIcon,
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur shadow-md rounded-b-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl text-blue-600 tracking-tight select-none">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#3B82F6"/>
              <path d="M10 22L16 10L22 22H10Z" fill="#fff"/>
            </svg>
            CampusEvents
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive('/') ? 'text-blue-600 bg-blue-100' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <HomeIcon className="h-5 w-5" /> Home
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive('/dashboard') ? 'text-blue-600 bg-blue-100' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <UserCircleIcon className="h-5 w-5" /> Dashboard
              </Link>
            )}
            {user && (
              <Link
                to="/create-event"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive('/create-event') ? 'text-blue-600 bg-blue-100' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <PlusCircleIcon className="h-5 w-5" /> Create Event
              </Link>
            )}
            {!user && (
              <Link
                to="/login"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" /> Login
              </Link>
            )}
            {!user && (
              <Link
                to="/register"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150"
              >
                <UserPlusIcon className="h-5 w-5" /> Register
              </Link>
            )}
            {user && (
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full">
                    <img
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
                      alt={user.name}
                      className="h-9 w-9 rounded-full border-2 border-blue-200 shadow-sm object-cover"
                    />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-lg shadow-lg focus:outline-none z-50">
                    <div className="px-4 py-3 flex items-center gap-3">
                      <img
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
                        alt={user.name}
                        className="h-10 w-10 rounded-full border border-blue-100 object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`$ {
                              active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                            } flex items-center w-full px-4 py-2 text-sm gap-2`}
                          >
                            <ArrowLeftOnRectangleIcon className="h-5 w-5" /> Logout
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <XMarkIcon className="h-7 w-7" />
              ) : (
                <Bars3Icon className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <Transition
          show={isOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 -translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-2"
        >
          <div className="md:hidden mt-2 rounded-lg shadow bg-white border border-gray-100 py-2 px-3 space-y-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-150 ${
                isActive('/') ? 'text-blue-600 bg-blue-100' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <HomeIcon className="h-5 w-5" /> Home
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-150 ${
                  isActive('/dashboard') ? 'text-blue-600 bg-blue-100' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <UserCircleIcon className="h-5 w-5" /> Dashboard
              </Link>
            )}
            {user && (
              <Link
                to="/create-event"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-150 ${
                  isActive('/create-event') ? 'text-blue-600 bg-blue-100' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <PlusCircleIcon className="h-5 w-5" /> Create Event
              </Link>
            )}
            {!user && (
              <Link
                to="/login"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
                onClick={() => setIsOpen(false)}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" /> Login
              </Link>
            )}
            {!user && (
              <Link
                to="/register"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150"
                onClick={() => setIsOpen(false)}
              >
                <UserPlusIcon className="h-5 w-5" /> Register
              </Link>
            )}
            {user && (
              <div className="flex items-center gap-3 px-3 py-2 mt-2 border-t border-gray-100">
                <img
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-blue-100 object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-1 text-red-600 hover:text-red-500 text-sm font-medium"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" /> Logout
                </button>
              </div>
            )}
          </div>
        </Transition>
      </div>
    </nav>
  );
};

export default Navbar;
