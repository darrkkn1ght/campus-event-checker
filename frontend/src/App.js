import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventDetail from './pages/EventDetail';
import EventForm from './components/EventForm';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import { authAPI } from './api';

function useApplyTheme() {
  const [themePref, setThemePref] = useState('system');

  useEffect(() => {
    // Try to get theme from backend if logged in
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getThemePreference()
        .then(res => setThemePref(res.data.themePreference))
        .catch(() => setThemePref('system'));
    } else {
      setThemePref('system');
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (themePref === 'dark') {
      root.classList.add('dark');
    } else if (themePref === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [themePref]);
}

const App = () => {
  useApplyTheme();

  return (
    <Router>
      <Navbar />
      <div className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-event"
            element={
              <ProtectedRoute>
                <EventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-event/:id"
            element={
              <ProtectedRoute>
                <EventForm isEdit={true} />
              </ProtectedRoute>
            }
          />
        <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
