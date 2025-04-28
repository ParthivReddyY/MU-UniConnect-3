import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Card component for display in the Bookings.js page
const EventBookingCard = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className="relative overflow-hidden bg-white/30 rounded-xl shadow-lg h-full border border-white/20 backdrop-filter backdrop-blur-md"
      whileHover={{ y: -5, boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.2), 0 10px 20px -5px rgba(0, 0, 0, 0.15)' }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/70 to-pink-600/70" />
      <div className="absolute inset-0 bg-black/5 backdrop-filter backdrop-blur-[2px]" />
      
      <div className="absolute top-4 right-4 bg-white/30 backdrop-filter backdrop-blur-md rounded-full p-2.5 shadow-lg">
        <i className="fas fa-ticket-alt text-base text-white"></i>
      </div>
      
      <div className="relative p-6 z-10 h-full flex flex-col">
        <h3 className="text-xl font-bold mb-2 text-white drop-shadow-md">Event Booking</h3>
        
        <div className="my-3 bg-white/50 h-px w-16" />
        
        <p className="text-white/95 mb-4 flex-grow text-sm leading-relaxed drop-shadow-sm">
          Book tickets for concerts, cultural events, technical symposiums, 
          and other exciting university experiences.
        </p>
        
        <div className="mt-auto space-y-3">
          <div className="flex items-center text-white text-sm font-medium">
            <i className="fas fa-calendar-alt mr-2.5 text-white/90"></i>
            <span>Various events available</span>
          </div>
          
          <motion.div
            animate={{ scale: isHovered ? 1.02 : 1 }}
          >
            <Link 
              to="/college/bookings/events"
              className="w-full py-2.5 px-4 rounded-lg font-medium bg-white/90 shadow-md hover:bg-white/100 text-pink-700 transition-all text-sm flex items-center justify-center"
            >
              <i className="fas fa-ticket-alt mr-2"></i>
              Browse Events
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventBookingCard;