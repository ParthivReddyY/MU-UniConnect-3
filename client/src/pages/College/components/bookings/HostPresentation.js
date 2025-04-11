import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';

const HostPresentation = () => {
  useAuth(); // Keep the authentication context without extracting unused variables
  const [isLoading, setIsLoading] = useState(true);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
      // Mock data - in a real app, fetch from backend
      setSlots([
        { id: 1, date: '2023-10-25', startTime: '10:00', endTime: '11:00', location: 'Conference Room A', status: 'Available' },
        { id: 2, date: '2023-10-26', startTime: '14:00', endTime: '15:30', location: 'Auditorium', status: 'Available' },
        { id: 3, date: '2023-10-27', startTime: '11:00', endTime: '12:00', location: 'Seminar Hall B', status: 'Booked' }
      ]);
    }, 1000);
  }, []);

  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
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
              <h1 className="text-3xl font-bold text-white">Host Presentation Slots</h1>
              <p className="text-amber-50 mt-2">Create and manage presentation slots for students</p>
            </div>

            <div className="p-6">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Your Presentation Slots</h2>
                <button className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md shadow-sm transition-colors flex items-center">
                  <i className="fas fa-plus mr-2"></i> Add New Slot
                </button>
              </div>

              {/* Slots Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {slots.map(slot => (
                      <tr key={slot.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-700">{slot.date}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{`${slot.startTime} - ${slot.endTime}`}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{slot.location}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            slot.status === 'Available' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {slot.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default HostPresentation;
