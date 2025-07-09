import React, { useEffect, useState } from 'react';
import { eventAPI } from '../api';
import { CalendarIcon, MapPinIcon, TagIcon, TicketIcon, QrCodeIcon, DocumentArrowDownIcon, XCircleIcon, CheckCircleIcon, ExclamationCircleIcon, CurrencyNairaIcon, UserIcon } from '@heroicons/react/24/outline';

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
  Study: 'bg-blue-100 text-blue-600 border-blue-300',
  StudyGroup: 'bg-blue-100 text-blue-600 border-blue-300',
  'Study Group': 'bg-blue-100 text-blue-600 border-blue-300',
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
  Study: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=600&q=80',
  StudyGroup: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
  'Study Group': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
  Other: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80',
};

const getCategoryImage = (category, fallback) => {
  return categoryImages[category] || fallback || categoryImages.Other;
};

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await eventAPI.getMyTickets();
        setTickets(response.data.tickets);
      } catch (err) {
        setError('Failed to load your tickets.');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleDownloadPDF = (ticketId) => {
    window.open(`/api/events/tickets/${ticketId}/download`, '_blank');
  };

  const handleShowQR = (ticketId) => {
    window.open(`/api/events/tickets/${ticketId}/qr`, '_blank');
  };

  const handleCancelTicket = async (ticketId) => {
    setActionLoading(ticketId);
    setActionMessage('');
    try {
      const response = await eventAPI.cancelTicket(ticketId);
      setActionMessage(response.data.message || 'Ticket cancelled.');
      setTickets(tickets.map(t => t._id === ticketId ? { ...t, cancelled: true } : t));
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to cancel ticket.');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading your tickets...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-10 px-2">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2"><TicketIcon className="w-8 h-8 text-blue-500" /> My Tickets</h1>
        {actionMessage && <div className="mb-4 text-center text-blue-700 font-semibold">{actionMessage}</div>}
        {tickets.length === 0 ? (
          <div className="text-center py-12 text-gray-600 flex flex-col items-center">
            <img src="https://illustrations.popsy.co/gray/ticket.svg" alt="No tickets" className="w-40 h-40 mb-4" />
            <div className="font-semibold text-lg mb-2">You have no tickets yet.</div>
            <div className="text-sm">Browse events and get your first ticket!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {tickets.map(ticket => {
              const event = ticket.event || {};
              const catColor = categoryColors[event.category] || categoryColors.Other;
              const eventImage = event.image || getCategoryImage(event.category);
              const status = ticket.cancelled ? 'Cancelled' : ticket.checkedIn ? 'Checked In' : ticket.paymentStatus === 'paid' ? 'Active' : ticket.paymentStatus;
              const statusColor = ticket.cancelled ? 'bg-red-100 text-red-600' : ticket.checkedIn ? 'bg-green-100 text-green-700' : ticket.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700';
              const isWaitlist = ticket.waitlist;
              return (
                <div key={ticket._id} className="bg-white rounded-xl shadow p-0 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-blue-50 overflow-hidden">
                  {/* Event Image */}
                  <div className="w-full md:w-48 h-32 md:h-32 flex-shrink-0 relative">
                    <img src={eventImage} alt={event.title + ' event'} className="w-full h-full object-cover" />
                    <span className={`absolute left-3 top-3 px-3 py-1 rounded-full text-xs font-bold shadow border-2 z-10 ${catColor}`}>{event.category}</span>
                  </div>
                  {/* Ticket Info */}
                  <div className="flex-1 p-4 flex flex-col gap-2">
                    <div className="font-bold text-lg text-blue-700 mb-1 flex items-center gap-2">{event.title} {isWaitlist && <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs animate-pulse">Waitlist</span>}</div>
                    <div className="text-gray-600 text-sm mb-1 flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> {new Date(event.date).toLocaleString()} <MapPinIcon className="w-4 h-4 ml-4" /> {event.location}</div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-2"><TagIcon className="w-4 h-4" /> {event.category}</div>
                    <div className="text-xs text-gray-500 mb-1">Ticket ID: {ticket._id}</div>
                    <div className="text-xs text-gray-500 mb-1">Reference: {ticket.reference || 'N/A'}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow ${statusColor}`}>{status}</span>
                      {event.isPaid ? (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold"><CurrencyNairaIcon className="w-4 h-4" /> {event.price}</span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold"><CheckCircleIcon className="w-4 h-4" /> Free</span>
                      )}
                    </div>
                    {isWaitlist && ticket.claimUrl && (
                      <a href={ticket.claimUrl} className="inline-block mt-2 px-4 py-2 bg-yellow-400 text-white rounded-full font-semibold shadow hover:bg-yellow-500 transition" target="_blank" rel="noopener noreferrer">Claim Ticket</a>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:items-end p-4">
                    <button onClick={() => handleDownloadPDF(ticket._id)} className="px-4 py-2 rounded bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition-all flex items-center gap-2" title="Download PDF"><DocumentArrowDownIcon className="w-5 h-5" /> PDF</button>
                    <button onClick={() => handleShowQR(ticket._id)} className="px-4 py-2 rounded bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition-all flex items-center gap-2" title="Show QR Code"><QrCodeIcon className="w-5 h-5" /> QR Code</button>
                    {!ticket.cancelled && !ticket.checkedIn && !isWaitlist && (
                      <button onClick={() => handleCancelTicket(ticket._id)} disabled={actionLoading === ticket._id} className="px-4 py-2 rounded bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition-all flex items-center gap-2 disabled:opacity-50" title="Cancel Ticket">
                        <XCircleIcon className="w-5 h-5" /> {actionLoading === ticket._id ? 'Cancelling...' : 'Cancel Ticket'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets; 