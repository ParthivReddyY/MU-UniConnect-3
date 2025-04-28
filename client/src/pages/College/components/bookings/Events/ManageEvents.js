import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchHostedEvents = async () => {
      try {
        const response = await axios.get(`/api/events/hosted/${currentUser._id}`);
        setEvents(response.data.events || []);
      } catch (error) {
        console.error('Error fetching hosted events:', error);
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?._id) {
      fetchHostedEvents();
    }
  }, [currentUser]);

  const handleEdit = (eventId) => {
    navigate(`/college/bookings/edit-event/${eventId}`);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/events/${eventId}`);
        setEvents(events.filter(event => event._id !== eventId));
        toast.success('Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const handleCreateNew = () => {
    // Navigate to the main HostEvent form
    navigate('/host-event');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Your Events</h1>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>
          Host New Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-gray-500 mb-4">
            <i className="fas fa-calendar-xmark text-4xl"></i>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Events Yet</h2>
          <p className="text-gray-600 mb-6">You haven't hosted any events yet.</p>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-primary-red text-white rounded-lg hover:bg-secondary-red transition-colors"
          >
            Host Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="relative h-48 overflow-hidden">
                {event.imageUrl ? (
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <i className="fas fa-calendar-alt text-4xl text-gray-400"></i>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-white text-sm font-medium">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                    {' • '}
                    {event.time}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 line-clamp-2">{event.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{event.caption || 'No caption provided'}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div>
                    <i className="fas fa-map-marker-alt mr-1"></i> {event.venue}
                  </div>
                  <div>
                    <i className="fas fa-ticket mr-1"></i> 
                    {event.bookedSeats ?? 0}/{event.totalSeats} booked
                  </div>
                </div>
                
                <div className="flex justify-between gap-2">
                  <button
                    onClick={() => handleEdit(event._id)}
                    className="flex-1 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-center"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-center"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageEvents;