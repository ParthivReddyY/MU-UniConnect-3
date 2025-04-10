import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FacultyAppointment = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className="relative overflow-hidden bg-white rounded-2xl shadow-lg"
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 opacity-90" />
      
      <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md rounded-full p-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      
      <div className="relative p-7 z-10 h-full flex flex-col">
        <h3 className="text-2xl font-bold mb-2 text-white">Faculty Appointment</h3>
        
        <div className="my-4 bg-white/20 backdrop-blur-md h-px w-16" />
        
        <p className="text-white/90 mb-6 flex-grow">
          Schedule meetings with professors during their office hours for academic guidance, 
          project discussions, or personal mentoring.
        </p>
        
        <div className="mt-auto space-y-4">
          <div className="flex items-center text-white/90 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Typical duration: 15-30 minutes</span>
          </div>
          
          <motion.button 
            className="w-full py-3 px-4 rounded-xl font-medium bg-white text-blue-600 shadow-md hover:shadow-lg transition-all"
            whileTap={{ scale: 0.97 }}
            animate={{ scale: isHovered ? 1.03 : 1 }}
          >
            Schedule Meeting
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default FacultyAppointment;
