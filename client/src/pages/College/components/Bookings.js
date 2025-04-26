import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

// Faculty Appointment Component
export const FacultyAppointment = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const handleScheduleMeeting = () => {
    navigate('/college/bookings/faculty-appointment');
  };
  
  // Only hide for faculty members, show for students and admins
  if (hasRole(['faculty'])) {
    return null;
  }
  
  return (
    <motion.div 
      className="relative overflow-hidden bg-white/30 rounded-xl shadow-lg h-full border border-white/20 backdrop-filter backdrop-blur-md"
      whileHover={{ y: -5, boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.2), 0 10px 20px -5px rgba(0, 0, 0, 0.15)' }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/70 to-blue-600/70" />
      <div className="absolute inset-0 bg-black/5 backdrop-filter backdrop-blur-[2px]" />
      
      <div className="absolute top-4 right-4 bg-white/30 backdrop-filter backdrop-blur-md rounded-full p-2.5 shadow-lg">
        <i className="fas fa-user-tie text-base text-white"></i>
      </div>
      
      <div className="relative p-6 z-10 h-full flex flex-col">
        <h3 className="text-xl font-bold mb-2 text-white drop-shadow-md">Faculty Appointment</h3>
        
        <div className="my-3 bg-white/50 h-px w-16" />
        
        <p className="text-white/95 mb-4 flex-grow text-sm leading-relaxed drop-shadow-sm">
          Schedule meetings with professors during their office hours for academic guidance, 
          project discussions, or personal mentoring.
        </p>
        
        <div className="mt-auto space-y-3">
          <div className="flex items-center text-white text-sm font-medium">
            <i className="fas fa-clock mr-2.5 text-white/90"></i>
            <span>Typical duration: 15-30 minutes</span>
          </div>
          
          <motion.button 
            className="w-full py-2.5 px-4 rounded-lg font-medium bg-white/90 shadow-md hover:bg-white/100 text-teal-700 transition-all text-sm flex items-center justify-center"
            whileTap={{ scale: 0.97 }}
            animate={{ scale: isHovered ? 1.02 : 1 }}
            onClick={handleScheduleMeeting}
          >
            <i className="fas fa-calendar-plus mr-2"></i>
            Schedule Meeting
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Student Appointments Component (for faculty to view appointments)
export const StudentAppointments = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const handleViewAppointments = () => {
    navigate('/faculty-appointments');
  };
  
  // Show for faculty and admins
  if (!hasRole(['faculty', 'admin'])) {
    return null;
  }
  
  return (
    <motion.div 
      className="relative overflow-hidden bg-white/30 rounded-xl shadow-lg h-full border border-white/20 backdrop-filter backdrop-blur-md"
      whileHover={{ y: -5, boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.2), 0 10px 20px -5px rgba(0, 0, 0, 0.15)' }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/70 to-purple-600/70" />
      <div className="absolute inset-0 bg-black/5 backdrop-filter backdrop-blur-[2px]" />
      
      <div className="absolute top-4 right-4 bg-white/30 backdrop-filter backdrop-blur-md rounded-full p-2.5 shadow-lg">
        <i className="fas fa-clipboard-list text-base text-white"></i>
      </div>
      
      <div className="relative p-6 z-10 h-full flex flex-col">
        <h3 className="text-xl font-bold mb-2 text-white drop-shadow-md">Student Appointments</h3>
        
        <div className="my-3 bg-white/50 h-px w-16" />
        
        <p className="text-white/95 mb-4 flex-grow text-sm leading-relaxed drop-shadow-sm">
          View, approve, and manage appointment requests from students. 
          Set meeting availability and track upcoming meetings.
        </p>
        
        <div className="mt-auto space-y-3">
          <div className="flex items-center text-white text-sm font-medium">
            <i className="fas fa-calendar-check mr-2.5 text-white/90"></i>
            <span>Manage appointment requests</span>
          </div>
          
          <motion.button 
            className="w-full py-2.5 px-4 rounded-lg font-medium bg-white/90 shadow-md hover:bg-white/100 text-indigo-700 transition-all text-sm flex items-center justify-center"
            whileTap={{ scale: 0.97 }}
            animate={{ scale: isHovered ? 1.02 : 1 }}
            onClick={handleViewAppointments}
          >
            <i className="fas fa-eye mr-2"></i>
            View Appointments
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
          Book auditoriums, seminar halls, and other venues for cultural events, 
          technical symposiums, and other student activities.
        </p>
        
        <div className="mt-auto space-y-3">
          <div className="flex items-center text-white text-sm font-medium">
            <i className="fas fa-map-marker-alt mr-2.5 text-white/90"></i>
            <span>Various locations available</span>
          </div>
          
          <motion.button 
            className="w-full py-2.5 px-4 rounded-lg font-medium bg-white/90 shadow-md hover:bg-white/100 text-pink-700 transition-all text-sm flex items-center justify-center"
            whileTap={{ scale: 0.97 }}
            animate={{ scale: isHovered ? 1.02 : 1 }}
          >
            <i className="fas fa-bookmark mr-2"></i>
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Presentation Slot Booking Component
export const PresentationSlot = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  const handleBookPresentation = () => {
    navigate('/college/bookings/presentation-slot');
  };
  
  return (
    <motion.div 
      className="relative overflow-hidden bg-white/30 rounded-xl shadow-lg h-full border border-white/20 backdrop-filter backdrop-blur-md"
      whileHover={{ y: -5, boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.2), 0 10px 20px -5px rgba(0, 0, 0, 0.15)' }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#062741]/75 to-[#104872]/75" />
      <div className="absolute inset-0 bg-black/5 backdrop-filter backdrop-blur-[2px]" />
      
      <div className="absolute top-4 right-4 bg-white/30 backdrop-filter backdrop-blur-md rounded-full p-2.5 shadow-lg">
        <i className="fas fa-laptop-code text-base text-white"></i>
      </div>
      
      <div className="relative p-6 z-10 h-full flex flex-col">
        <h3 className="text-xl font-bold mb-2 text-white drop-shadow-md">Book Presentation Slot</h3>
        
        <div className="my-3 bg-white/50 h-px w-16" />
        
        <p className="text-white/95 mb-4 flex-grow text-sm leading-relaxed drop-shadow-sm">
          Book available slots for your academic presentations, project defense, 
          or thesis demonstrations.
        </p>
        
        <div className="mt-auto space-y-3">
          <div className="flex items-center text-white text-sm font-medium">
            <i className="fas fa-calendar-alt mr-2.5 text-white/90"></i>
            <span>Various time slots available</span>
          </div>
          
          <motion.button 
            className="w-full py-2.5 px-4 rounded-lg font-medium bg-white/90 shadow-md hover:bg-white/100 text-[#083557] transition-all text-sm flex items-center justify-center"
            whileTap={{ scale: 0.97 }}
            animate={{ scale: isHovered ? 1.02 : 1 }}
            onClick={handleBookPresentation}
          >
            <i className="fas fa-search mr-2"></i>
            View Available Slots
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Host Presentation Component (for faculty)
export const HostPresentation = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const handleHostPresentation = () => {
    navigate('/college/bookings/host-presentation');
  };
  
  // Only show for faculty and admin
  if (!hasRole(['faculty', 'admin'])) {
    return null;
  }
  
  return (
    <motion.div 
      className="relative overflow-hidden bg-white/30 rounded-xl shadow-lg h-full border border-white/20 backdrop-filter backdrop-blur-md"
      whileHover={{ y: -5, boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.2), 0 10px 20px -5px rgba(0, 0, 0, 0.15)' }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#a04f35]/75 to-[#d46e48]/75" />
      <div className="absolute inset-0 bg-black/5 backdrop-filter backdrop-blur-[2px]" />
      
      <div className="absolute top-4 right-4 bg-white/30 backdrop-filter backdrop-blur-md rounded-full p-2.5 shadow-lg">
        <i className="fas fa-chalkboard-teacher text-base text-white"></i>
      </div>
      
      <div className="relative p-6 z-10 h-full flex flex-col">
        <h3 className="text-xl font-bold mb-2 text-white drop-shadow-md">Host Presentation Slot</h3>
        
        <div className="my-3 bg-white/50 h-px w-16" />
        
        <p className="text-white/95 mb-4 flex-grow text-sm leading-relaxed drop-shadow-sm">
          Create and manage presentation slots for student presentations, project defense, 
          or thesis demonstrations.
        </p>
        
        <div className="mt-auto space-y-3">
          <div className="flex items-center text-white text-sm font-medium">
            <i className="fas fa-plus-circle mr-2.5 text-white/90"></i>
            <span>Easily create multiple slots</span>
          </div>
          
          <motion.button 
            className="w-full py-2.5 px-4 rounded-lg font-medium bg-white/90 shadow-md hover:bg-white/100 text-[#a04f35] transition-all text-sm flex items-center justify-center"
            whileTap={{ scale: 0.97 }}
            animate={{ scale: isHovered ? 1.02 : 1 }}
            onClick={handleHostPresentation}
          >
            <i className="fas fa-cogs mr-2"></i>
            Manage Presentation Slots
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Main Bookings Component
const Bookings = () => {
  const { hasRole } = useAuth();
  
  return (
    <div className="px-4 py-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            University Bookings
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm">
            Reserve resources, schedule appointments, and book facilities with our streamlined booking system
          </p>
        </div>
        
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto"
        >
          <div className="contents">
            {/* Event Booking - always visible */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0 }}
              className="h-[312px]" /* Increased from 260px to 312px (20% increase) */
            >
              <EventBooking />
            </motion.div>
            
            {/* Faculty Appointment (for students) or Student Appointments (for faculty) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="h-[312px]" /* Increased from 260px to 312px (20% increase) */
            >
              {hasRole(['faculty']) ? <StudentAppointments /> : <FacultyAppointment />}
            </motion.div>
            
            {/* Presentation Slot - always visible */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="h-[312px]" /* Increased from 260px to 312px (20% increase) */
            >
              <PresentationSlot />
            </motion.div>
            
            {/* Host Presentation - visible only for faculty */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              className="h-[312px]" /* Increased from 260px to 312px (20% increase) */
            >
              <HostPresentation />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Bookings;
