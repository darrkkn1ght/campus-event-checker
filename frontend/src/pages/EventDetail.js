import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventAPI } from '../api';
import { CalendarDaysIcon, MapPinIcon, ClockIcon, TagIcon, UserCircleIcon, ArrowUturnLeftIcon, UserPlusIcon, ShareIcon, PlusCircleIcon, SparklesIcon, UserGroupIcon, CheckCircleIcon, XCircleIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import QRScanner from '../components/QRScanner';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanFeedback, setScanFeedback] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [waitlist, setWaitlist] = useState([]);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventAPI.getEvent(id);
        setEvent(response.data);
        // Fetch related events (same category, exclude current)
        const rel = await eventAPI.getEvents({ category: response.data.category });
        setRelatedEvents(rel.data.filter(e => e._id !== id).slice(0, 3));
      } catch (error) {
        setError('Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (event && event.createdBy && event.currentUser) {
      setIsOrganizer(event.createdBy._id === event.currentUser._id || event.currentUser.role === 'admin');
    }
  }, [event]);

  const fetchAttendees = async () => {
    setAttendeesLoading(true);
    try {
      const response = await eventAPI.getEventAttendees(id);
      setAttendees(response.data.attendees);
    } catch (err) {
      setAttendees([]);
    } finally {
      setAttendeesLoading(false);
    }
  };

  const handleRSVP = async () => {
    setActionLoading(true);
    setActionMessage('');
    try {
      const response = await eventAPI.rsvpEvent(id);
      setActionMessage(response.data.message || 'RSVP successful! Check your email for your ticket.');
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'RSVP failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async () => {
    setActionLoading(true);
    setActionMessage('');
    try {
      const response = await eventAPI.payForEvent(id);
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        setActionMessage('Payment initiation failed.');
      }
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Payment failed.');
      setActionLoading(false);
    }
  };

  const handleWaitlist = async () => {
    setActionLoading(true);
    setActionMessage('');
    try {
      const response = await eventAPI.joinWaitlist(id);
      setActionMessage(response.data.message || 'Added to waitlist!');
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to join waitlist.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScan = async (qrText) => {
    setScanLoading(true);
    setScanFeedback('');
    try {
      // Assume qrText is the ticket ID or code
      const response = await eventAPI.checkInTicket(id, qrText);
      setScanFeedback(response.data.message || 'Check-in successful!');
      fetchAttendees();
    } catch (err) {
      setScanFeedback(err.response?.data?.message || 'Invalid or already checked-in ticket.');
    } finally {
      setScanLoading(false);
      setTimeout(() => setScannerOpen(false), 1200);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await eventAPI.getEventAnalytics(id);
      setAnalytics(response.data);
    } catch (err) {
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchWaitlist = async () => {
    setWaitlistLoading(true);
    try {
      const response = await eventAPI.getEventWaitlist(id);
      setWaitlist(response.data.waitlist);
    } catch (err) {
      setWaitlist([]);
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleCancelEvent = async () => {
    setCancelLoading(true);
    setCancelFeedback('');
    try {
      const response = await eventAPI.cancelEvent(id);
      setCancelFeedback(response.data.message || 'Event cancelled.');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setCancelFeedback(err.response?.data?.message || 'Failed to cancel event.');
    } finally {
      setCancelLoading(false);
      setShowCancelConfirm(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-blue-500 font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="h-16 w-16 text-pink-400 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold">{error || 'Event not found.'}</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline font-medium">
            <ArrowUturnLeftIcon className="h-5 w-5 inline mr-1" /> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  // Determine action button
  let actionButton = null;
  if (event.cancelled) {
    actionButton = <span className="px-4 py-2 rounded-full bg-red-200 text-red-700 font-semibold">Event Cancelled</span>;
  } else if (typeof event.remainingTickets === 'number' && event.remainingTickets === 0) {
    actionButton = <button onClick={handleWaitlist} disabled={actionLoading} className="flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-400 text-white font-semibold shadow hover:bg-yellow-500 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-300">
      {actionLoading ? 'Joining...' : 'Join Waitlist'}
    </button>;
  } else if (!event.isPaid) {
    actionButton = <button onClick={handleRSVP} disabled={actionLoading} className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300">
      {actionLoading ? 'RSVPing...' : 'RSVP'}
    </button>;
  } else {
    actionButton = <button onClick={handlePay} disabled={actionLoading} className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition-all focus:outline-none focus:ring-2 focus:ring-green-300">
      {actionLoading ? 'Redirecting...' : 'Buy Ticket'}
    </button>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-10 px-2">
      <div className="max-w-3xl mx-auto">
        {/* Event Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-300" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <CalendarDaysIcon className="h-8 w-8 text-blue-400" /> {event.title}
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shadow-sm bg-blue-50 text-blue-700">
              <TagIcon className="w-5 h-5 mr-1" /> {event.category}
            </span>
          </div>
          <p className="text-gray-700 text-lg mb-6">{event.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-center text-gray-600 text-base">
                <CalendarDaysIcon className="h-6 w-6 mr-2 text-blue-400" />
                {formatDate(event.date)}
              </div>
              <div className="flex items-center text-gray-600 text-base">
                <ClockIcon className="h-6 w-6 mr-2 text-pink-400" />
                {event.time}
              </div>
              <div className="flex items-center text-gray-600 text-base">
                <MapPinIcon className="h-6 w-6 mr-2 text-yellow-400" />
                {event.location}
              </div>
              <div className="flex items-center text-gray-600 text-base">
                <span className="font-bold text-blue-600 mr-2">{event.isPaid ? `₦${event.price}` : 'Free'}</span>
                {typeof event.remainingTickets === 'number' && (
                  <span className={event.remainingTickets === 0 ? 'text-red-500' : 'text-green-600'}>
                    {event.remainingTickets === 0 ? 'Full' : `${event.remainingTickets} left`}
                  </span>
                )}
              </div>
            </div>
            {/* Organizer Info */}
            <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-4">
              <img
                src={event.createdBy?.avatarUrl || `https://ui-avatars.com/api/?name=${event.createdBy?.name || 'Organizer'}`}
                alt={event.createdBy?.name || 'Organizer'}
                className="h-14 w-14 rounded-full border-2 border-blue-200 object-cover"
              />
              <div>
                <div className="font-semibold text-blue-700 flex items-center gap-1">
                  <UserCircleIcon className="h-5 w-5" /> {event.createdBy?.name || 'Organizer'}
                </div>
                <div className="text-xs text-gray-500">Organizer</div>
              </div>
            </div>
          </div>
          {/* Map/Location Section */}
          <div className="mb-8">
            <div className="rounded-xl overflow-hidden shadow border border-blue-100">
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(event.location)}&zoom=15&size=600x200&key=YOUR_GOOGLE_MAPS_API_KEY`}
                alt={`Map of ${event.location}`}
                className="w-full h-48 object-cover"
                onError={e => { e.target.src = 'https://placehold.co/600x200?text=Map+Unavailable'; }}
              />
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-4">
            {actionButton}
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-pink-500 text-white font-semibold shadow hover:bg-pink-600 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300">
              <ShareIcon className="h-5 w-5" /> Share
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-400 text-white font-semibold shadow hover:bg-yellow-500 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-300">
              <PlusCircleIcon className="h-5 w-5" /> Add to Calendar
            </button>
          </div>
          {actionMessage && <div className="my-4 text-center text-blue-700 font-semibold">{actionMessage}</div>}
          <Link to="/" className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium mt-2">
            <ArrowUturnLeftIcon className="h-5 w-5" /> Back to Events
          </Link>
        </div>

        {isOrganizer && !event.cancelled && (
          <>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="mt-4 px-5 py-2 rounded-full bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Cancel Event
            </button>
            {showCancelConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
                  <h2 className="text-xl font-bold mb-4 text-red-600">Cancel Event?</h2>
                  <p className="mb-6 text-gray-700">Are you sure you want to cancel this event? All attendees will be notified and refunded if applicable.</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleCancelEvent}
                      disabled={cancelLoading}
                      className="px-5 py-2 rounded-full bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition disabled:opacity-50"
                    >
                      {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Event'}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold shadow hover:bg-gray-300 transition"
                    >
                      No, Go Back
                    </button>
                  </div>
                  {cancelFeedback && <div className="mt-4 text-red-600 font-semibold">{cancelFeedback}</div>}
                </div>
              </div>
            )}
          </>
        )}

        {isOrganizer && (
          <div className="mt-10">
            <button
              onClick={() => {
                setShowAttendees(!showAttendees);
                if (!showAttendees && attendees.length === 0) fetchAttendees();
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition mb-4"
            >
              <UserGroupIcon className="w-5 h-5" /> {showAttendees ? 'Hide' : 'Show'} Attendees
            </button>
            {showAttendees && (
              <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2"><UserGroupIcon className="w-6 h-6 text-blue-400" /> Attendees</h2>
                  <button
                    onClick={() => setScannerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition"
                  >
                    <QrCodeIcon className="w-5 h-5" /> Scan QR Code
                  </button>
                </div>
                <QRScanner open={scannerOpen} onScan={handleScan} onClose={() => setScannerOpen(false)} />
                {scanFeedback && (
                  <div className={`mb-4 text-center font-semibold ${scanLoading ? 'text-blue-500' : scanFeedback.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{scanFeedback}</div>
                )}
                {attendeesLoading ? (
                  <div className="text-blue-500">Loading attendees...</div>
                ) : attendees.length === 0 ? (
                  <div className="text-gray-500">No attendees yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Email</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Check-In</th>
                          <th className="px-3 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendees.map((a) => (
                          <tr key={a._id} className="border-b">
                            <td className="px-3 py-2">{a.user?.name || 'N/A'}</td>
                            <td className="px-3 py-2">{a.user?.email || 'N/A'}</td>
                            <td className="px-3 py-2">
                              {a.cancelled ? (
                                <span className="flex items-center gap-1 text-xs text-red-600"><XCircleIcon className="w-4 h-4" /> Cancelled</span>
                              ) : a.checkedIn ? (
                                <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircleIcon className="w-4 h-4" /> Checked In</span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-blue-600"><QrCodeIcon className="w-4 h-4" /> Active</span>
                              )}
                            </td>
                            <td className="px-3 py-2">{a.checkedIn ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-2">
                              <button className="px-3 py-1 rounded bg-green-50 text-green-700 font-semibold flex items-center gap-1 hover:bg-green-100 transition" title="Show QR Code"><QrCodeIcon className="w-4 h-4" /> QR</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {isOrganizer && (
          <div className="mt-10">
            <button
              onClick={() => {
                setShowAnalytics(!showAnalytics);
                if (!showAnalytics && !analytics) fetchAnalytics();
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500 text-white font-semibold shadow hover:bg-purple-600 transition mb-4"
            >
              <SparklesIcon className="w-5 h-5" /> {showAnalytics ? 'Hide' : 'Show'} Analytics
            </button>
            {showAnalytics && (
              <div className="bg-white rounded-xl shadow p-6 border border-purple-100">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-purple-400" /> Event Analytics</h2>
                {analyticsLoading ? (
                  <div className="text-purple-500">Loading analytics...</div>
                ) : !analytics ? (
                  <div className="text-gray-500">No analytics data available.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-purple-50 rounded-lg p-4 flex flex-col items-center">
                      <span className="text-3xl font-bold text-purple-700">{analytics.totalTickets}</span>
                      <span className="text-sm text-gray-600">Total Tickets Sold</span>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
                      <span className="text-3xl font-bold text-green-700">{analytics.checkedIn}</span>
                      <span className="text-sm text-gray-600">Checked In</span>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
                      <span className="text-3xl font-bold text-blue-700">₦{analytics.revenue}</span>
                      <span className="text-sm text-gray-600">Total Revenue</span>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 flex flex-col items-center">
                      <span className="text-3xl font-bold text-yellow-700">{analytics.waitlist}</span>
                      <span className="text-sm text-gray-600">On Waitlist</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {isOrganizer && (
          <div className="mt-10">
            <button
              onClick={() => {
                setShowWaitlist(!showWaitlist);
                if (!showWaitlist && waitlist.length === 0) fetchWaitlist();
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-500 text-white font-semibold shadow hover:bg-yellow-600 transition mb-4"
            >
              <UserPlusIcon className="w-5 h-5" /> {showWaitlist ? 'Hide' : 'Show'} Waitlist
            </button>
            {showWaitlist && (
              <div className="bg-white rounded-xl shadow p-6 border border-yellow-100">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><UserPlusIcon className="w-6 h-6 text-yellow-400" /> Event Waitlist</h2>
                {waitlistLoading ? (
                  <div className="text-yellow-500">Loading waitlist...</div>
                ) : waitlist.length === 0 ? (
                  <div className="text-gray-500">No users on the waitlist.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-yellow-50">
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Email</th>
                          <th className="px-3 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {waitlist.map((u) => (
                          <tr key={u._id} className="border-b">
                            <td className="px-3 py-2">{u.name || 'N/A'}</td>
                            <td className="px-3 py-2">{u.email || 'N/A'}</td>
                            <td className="px-3 py-2 flex gap-2">
                              <button className="px-3 py-1 rounded bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition" title="Notify User">Notify</button>
                              <button className="px-3 py-1 rounded bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition" title="Remove from Waitlist">Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Related/Upcoming Events */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-pink-400" /> Related Events
          </h2>
          {relatedEvents.length === 0 ? (
            <div className="text-gray-500 italic">No related events found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedEvents.map(ev => (
                <Link to={`/events/${ev._id}`} key={ev._id} className="block bg-white rounded-xl shadow hover:shadow-lg transition p-5 border border-blue-50">
                  <div className="flex items-center gap-3 mb-2">
                    <CalendarDaysIcon className="h-5 w-5 text-blue-400" />
                    <span className="font-semibold text-gray-900">{ev.title}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1 line-clamp-2">{ev.description}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ClockIcon className="h-4 w-4" /> {ev.time}
                    <MapPinIcon className="h-4 w-4" /> {ev.location}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
