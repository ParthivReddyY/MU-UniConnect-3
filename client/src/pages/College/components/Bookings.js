import React from 'react';
import { motion } from 'framer-motion';
import { 
  EventBooking, 
  FacultyAppointment, 
  PresentationSlot, 
  ProjectSubmission
} from './bookings/index';

const Bookings = () => {
  const bookings = [
    <EventBooking key="event" />, 
    <FacultyAppointment key="faculty" />, 
    <PresentationSlot key="presentation" />, 
    <ProjectSubmission key="project" />
  ];

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
          {bookings.map((booking, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {booking}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Bookings;
