import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../../contexts/AuthContext';
import api from '../../../../../utils/axiosConfig';

const HostedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Redirect if user is not faculty or admin
    if (!currentUser || !['admin', 'faculty'].includes(currentUser.role)) {
      navigate('/unauthorized');
      return;
    }
    
    fetchHostedEvents();
  }, [currentUser, navigate]);
  
  const fetchHostedEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/events/hosted');
      setEvents(response.data.events || []);
    } catch (err) {
      console.error('Error fetching hosted events:', err);
      setError('Failed to load your hosted events');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateEvent = () => {
    navigate('/college/bookings/events/host');
  };
  
  const handleEditEvent = (eventId) => {
    navigate(`/college/bookings/events/host/${eventId}`);
  };
  
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      await api.delete(`/api/events/hosted/${eventId}`);
      toast.success('Event deleted successfully');
      setEvents(events.filter(event => event._id !== eventId));
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchHostedEvents}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Hosted Events</h1>
        <button
          onClick={handleCreateEvent}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>
          Host New Event
        </button>
      </div>
      
      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-gray-500 mb-4">
            <i className="far fa-calendar-plus text-4xl"></i>
          </div>
          <h2 className="text-xl font-semibold mb-2">No events hosted yet</h2>
          <p className="text-gray-600 mb-6">Create your first event to get started</p>
          <button
            onClick={handleCreateEvent}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Host Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <motion.div
              key={event._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-40 w-full overflow-hidden">
                <img 
                  src={event.imageUrl || `https://picsum.photos/seed/${event._id}/800/400`} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                  {event.title}
                </h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {event.availableSeats} seats
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-1">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  <span className="truncate">{event.venue || 'No venue specified'}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <i className="far fa-clock mr-2"></i>
                  <span>{event.time || 'Time not specified'}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <button
                    onClick={() => handleEditEvent(event._id)}
                    className="px-3 py-1.5 border border-indigo-300 text-indigo-600 rounded hover:bg-indigo-50"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50"
                  >
                    <i className="fas fa-trash-alt mr-1"></i>
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostedEvents;