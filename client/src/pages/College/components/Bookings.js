import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Faculty Appointment Component
export const FacultyAppointment = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  const handleScheduleMeeting = () => {
    navigate('/college/bookings/faculty-appointment');
  };
  
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      
      <div className="relative p-7 z-10 h-full flex flex-col">
        <h3 className="text-2xl font-bold mb-2 text-black">Faculty Appointment</h3>
        
        <div className="my-4 bg-white/20 backdrop-blur-md h-px w-16" />
        
        <p className="text-black/90 mb-6 flex-grow">
          Schedule meetings with professors during their office hours for academic guidance, 
          project discussions, or personal mentoring.
        </p>
        
        <div className="mt-auto space-y-4">
          <div className="flex items-center text-black/90 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Typical duration: 15-30 minutes</span>
          </div>
          
          <motion.button 
            className="w-full py-3 px-4 rounded-xl font-medium bg-white text-black shadow-md hover:shadow-lg transition-all"
            whileTap={{ scale: 0.97 }}
            animate={{ scale: isHovered ? 1.03 : 1 }}
            onClick={handleScheduleMeeting}
          >
            Schedule Meeting
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Presentation Slot Component
export const PresentationSlot = () => {
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      
      <div className="relative p-7 z-10 h-full flex flex-col">
        <h3 className="text-2xl font-bold mb-2 text-black">Presentation Slot</h3>
        
        <div className="my-4 bg-white/20 backdrop-blur-md h-px w-16" />
        
        <p className="text-black/90 mb-6 flex-grow">
          Reserve time slots for project presentations, thesis defense, or seminar presentations 
          with the necessary equipment and facilities.
        </p>
        
        <div className="mt-auto space-y-4">
          <div className="flex items-center text-black/90 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Duration: 30-60 minutes</span>
          </div>
          
          <motion.button 
            className="w-full py-3 px-4 rounded-xl font-medium bg-white text-black shadow-md hover:shadow-lg transition-all"
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

// Project Submission Component
export const ProjectSubmission = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className="relative overflow-hidden bg-white rounded-2xl shadow-lg"
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 opacity-90" />
      
      <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md rounded-full p-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      
      <div className="relative p-7 z-10 h-full flex flex-col">
        <h3 className="text-2xl font-bold mb-2 text-black">Project Submission</h3>
        
        <div className="my-4 bg-white/20 backdrop-blur-md h-px w-16" />
        
        <p className="text-black/90 mb-6 flex-grow ">
          Submit your academic projects, research papers, and assignments through our 
          digital portal with easy tracking and feedback.
        </p>
        
        <div className="mt-auto space-y-4">
          <div className="flex items-center text-black/90 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Supports multiple file formats</span>
          </div>
          
          <motion.button 
            className="w-full py-3 px-4 rounded-xl font-medium bg-white text-black shadow-md hover:shadow-lg transition-all"
            whileTap={{ scale: 0.97 }}
            animate={{ scale: isHovered ? 1.03 : 1 }}
          >
            Submit Project
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Event Booking Component
export const EventBooking = () => {
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

// Main Bookings Component
const Bookings = () => {
  return (
    <div className="px-6 py-10 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2 text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600">
            University Bookings
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Reserve resources, schedule appointments, and book facilities with our streamlined booking system
          </p>
        </div>
        
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0 }}
          >
            <EventBooking />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <FacultyAppointment />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <PresentationSlot />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <ProjectSubmission />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Bookings;
