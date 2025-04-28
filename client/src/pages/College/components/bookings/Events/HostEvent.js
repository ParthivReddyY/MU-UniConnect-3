import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HostEvent = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Host Events</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manage Hosted Events Tile */}
        <motion.div 
          className="relative overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100"
          whileHover={{ y: -5, boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.07)' }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10" />
          
          <div className="p-6 relative">
            <div className="bg-blue-500/20 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
              <i className="fas fa-calendar-check text-blue-600 text-lg"></i>
            </div>
            
            <h3 className="text-xl font-bold mb-2 text-gray-800">Manage Hosted Events</h3>
            
            <p className="text-gray-600 mb-6">
              View, edit and manage all your currently hosted events. Track registrations, 
              update event details, and handle attendee communications.
            </p>
            
            <button 
              onClick={() => navigate('/college/bookings/manage-events')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <i className="fas fa-tasks mr-2"></i>
              Manage Events
            </button>
          </div>
        </motion.div>

        {/* Create New Event Tile */}
        <motion.div 
          className="relative overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100"
          whileHover={{ y: -5, boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.07)' }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-600/10" />
          
          <div className="p-6 relative">
            <div className="bg-green-500/20 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
              <i className="fas fa-calendar-plus text-green-600 text-lg"></i>
            </div>
            
            <h3 className="text-xl font-bold mb-2 text-gray-800">Host New Event</h3>
            
            <p className="text-gray-600 mb-6">
              Host a new event by providing details such as title, description, date, time, 
              location, and registration requirements.
            </p>
            
            <button 
              onClick={() => navigate('/host-event')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
            >
              <i className="fas fa-plus mr-2"></i>
              Host New Event
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HostEvent;