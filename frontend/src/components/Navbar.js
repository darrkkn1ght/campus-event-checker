import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

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
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">CampusEvents</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') ? 'text-primary bg-blue-50' : 'text-gray-700 hover:text-primary'
              }`}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/dashboard') ? 'text-primary bg-blue-50' : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-event"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/create-event') ? 'text-primary bg-blue-50' : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  Create Event
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Hello, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary focus:outline-none focus:text-primary"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') ? 'text-primary bg-blue-50' : 'text-gray-700 hover:text-primary'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/dashboard') ? 'text-primary bg-blue-50' : 'text-gray-700 hover:text-primary'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/create-event"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/create-event') ? 'text-primary bg-blue-50' : 'text-gray-700 hover:text-primary'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Create Event
                  </Link>
                  <div className="border-t border-gray-200 pt-4 pb-3">
                    <div className="px-3 py-2">
                      <p className="text-base font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="mt-1 block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 pt-4 pb-3 space-y-1">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white hover:bg-secondary"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;