import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PresentationSlot = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className="relative overflow-hidden bg-white rounded-2xl shadow-lg"
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-600 opacity-90" />
      
      <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md rounded-full p-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      
      <div className="relative p-7 z-10 h-full flex flex-col">
        <h3 className="text-2xl font-bold mb-2 text-white">Presentation Slot</h3>
        
        <div className="my-4 bg-white/20 backdrop-blur-md h-px w-16" />
        
        <p className="text-white/90 mb-6 flex-grow">
          Reserve time slots for project presentations, thesis defense, or seminar presentations 
          with the necessary equipment and facilities.
        </p>
        
        <div className="mt-auto space-y-4">
          <div className="flex items-center text-white/90 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Duration: 30-60 minutes</span>
          </div>
          
          <motion.button 
            className="w-full py-3 px-4 rounded-xl font-medium bg-white text-amber-600 shadow-md hover:shadow-lg transition-all"
            whileTap={{ scale: 0.97 }}
            animate={{ scale: isHovered ? 1.03 : 1 }}
          >
            Book Slot
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PresentationSlot;
