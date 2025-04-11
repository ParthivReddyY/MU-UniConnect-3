import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';

const PresentationSlot = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
      // Mock data - in a real app, fetch from backend
      setAvailableSlots([
        { id: 1, date: '2023-10-25', startTime: '10:00', endTime: '11:00', location: 'Conference Room A', host: 'Dr. Sarah Johnson', department: 'Computer Science' },
        { id: 2, date: '2023-10-26', startTime: '14:00', endTime: '15:30', location: 'Auditorium', host: 'Prof. Michael Chen', department: 'Electrical Engineering' },
        { id: 3, date: '2023-10-27', startTime: '11:00', endTime: '12:00', location: 'Seminar Hall B', host: 'Dr. Robert Smith', department: 'Mechanical Engineering' }
      ]);
    }, 1000);
  }, []);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowConfirmation(true);
  };

  const handleBooking = () => {
    // In a real application, make API call to book the slot with user information
    console.log(`Booking made by user: ${currentUser?.email || 'Unknown user'}`);
    alert(`Slot booked successfully for ${selectedSlot.date} at ${selectedSlot.startTime}`);
    setShowConfirmation(false);
    // After successful booking, you might want to refresh the slots
  };

  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-8 w-full"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Loading Indicator */}
        {isLoading ? (
          <div className="w-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <motion.div
            className="bg-white rounded-2xl shadow-xl overflow-hidden w-full border border-amber-100 mb-10"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Header */}
            <div className="p-8 bg-gradient-to-r from-amber-500 to-orange-500">
              <h1 className="text-3xl font-bold text-white">Book a Presentation Slot</h1>
              <p className="text-amber-50 mt-2">Reserve a time for your project presentation, thesis defense, or seminar</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Presentation Slots</h2>
                <p className="text-gray-600 mb-4">
                  Select an available slot to book your presentation. Each slot shows the date, time, location, and host faculty member.
                </p>
              </div>

              {/* Slots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSlots.map(slot => (
                  <div
                    key={slot.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-amber-300"
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">{slot.date}</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Available
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{`${slot.startTime} - ${slot.endTime}`}</h3>
                    <p className="text-gray-700 text-sm mb-2">{slot.location}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-user-tie mr-2"></i>
                      <span>{slot.host}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{slot.department}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-lg max-w-md w-full p-6"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Presentation Booking</h3>
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Are you sure you want to book this presentation slot?</p>
                <div className="bg-amber-50 p-3 rounded-md">
                  <div className="font-medium text-gray-800">{selectedSlot.date}</div>
                  <div className="text-gray-700">{`${selectedSlot.startTime} - ${selectedSlot.endTime}`}</div>
                  <div className="text-gray-700">{selectedSlot.location}</div>
                  <div className="text-gray-600 text-sm mt-1">Hosted by: {selectedSlot.host}</div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                  onClick={handleBooking}
                >
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PresentationSlot;
