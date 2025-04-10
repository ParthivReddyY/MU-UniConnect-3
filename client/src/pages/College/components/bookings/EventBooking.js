import React, { useState } from 'react';
import { motion } from 'framer-motion';

const EventBooking = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className="relative overflow-hidden bg-white rounded-2xl shadow-lg"
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-600 opacity-90" />
      
      <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md rounded-full p-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      
      <div className="relative p-7 z-10 h-full flex flex-col">
        <h3 className="text-2xl font-bold mb-2 text-black">Event Booking</h3>
        
        <div className="my-4 bg-white/20 backdrop-blur-md h-px w-16" />
        
        <p className="text-black/90 mb-6 flex-grow">
          Book auditoriums, seminar halls, and other venues for cultural events, 
          technical symposiums, and other student activities.
        </p>
        
        <div className="mt-auto space-y-4">
          <div className="flex items-center text-black/90 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Various locations available</span>
          </div>
          
          <motion.button 
            className="w-full py-3 px-4 rounded-xl font-medium bg-white text-black shadow-md hover:shadow-lg transition-all"
            whileTap={{ scale: 0.97 }}
            animate={{ scale: isHovered ? 1.03 : 1 }}
          >
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default EventBooking;
