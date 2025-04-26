import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../utils/axiosConfig';

const PresentationSlot = () => {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/presentations/available');
        setPresentations(response.data);
      } catch (err) {
        console.error('Error fetching available presentations:', err);
        setError('Failed to load available presentation slots');
      } finally {
        setLoading(false);
      }
    };

    fetchPresentations();
  }, []);

  const bookSlot = async (presentationId) => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/college/bookings/presentation-slot' } });
      return;
    }

    try {
      const response = await api.post(`/api/presentations/${presentationId}/book`);
      if (response.data.success) {
        // Update local state to reflect booking
        setPresentations(presentations.filter(p => p._id !== presentationId));
        alert('Presentation slot booked successfully!');
      }
    } catch (err) {
      console.error('Error booking presentation slot:', err);
      alert(err.response?.data?.message || 'Failed to book presentation slot');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Available Presentation Slots</h2>
            <p className="text-gray-600 max-w-2xl">
              Book available time slots for academic presentations, defense sessions, or project demonstrations
            </p>
          </div>
          <Link 
            to="/college/bookings"
            className="mt-4 md:mt-0 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition-colors flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Bookings
          </Link>
        </div>

        {presentations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden text-center p-12">
            <div className="bg-blue-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-calendar-times text-3xl text-blue-500"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Presentation Slots Available</h3>
            <p className="text-gray-600 mb-6">
              There are currently no open slots for presentations. Please check back later 
              or contact your department coordinator.
            </p>
            <Link 
              to="/college/bookings"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors"
            >
              Return to Bookings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentations.map(presentation => (
              <motion.div 
                key={presentation._id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium py-1 px-2 rounded">
                      {presentation.presentationType || 'Academic'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(presentation.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{presentation.title}</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <i className="fas fa-user-tie mt-1 mr-3 text-gray-400"></i>
                      <div>
                        <p className="text-sm text-gray-500">Faculty</p>
                        <p className="text-gray-800">{presentation.facultyName}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-clock mt-1 mr-3 text-gray-400"></i>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="text-gray-800">
                          {new Date(presentation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(presentation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-map-marker-alt mt-1 mr-3 text-gray-400"></i>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-gray-800">{presentation.location}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => bookSlot(presentation._id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center font-medium transition-colors"
                  >
                    <i className="fas fa-calendar-plus mr-2"></i>
                    Book This Slot
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationSlot;
