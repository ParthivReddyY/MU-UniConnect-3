import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import PresentationService from '../../../../services/PresentationService';
import { toast } from 'react-toastify';

// Import custom components and utilities
import PresentationForm from './PresentationForm';
import { formatDate, pageVariants } from './PresentationUtils';

const HostPresentation = () => {
  // Keep auth context for authorization purposes
  useAuth(); 
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [viewEventDetails, setViewEventDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load presentation events on mount
  useEffect(() => {
    fetchPresentationEvents();
  }, []);

  // Fetch presentation events created by the host
  const fetchPresentationEvents = async () => {
    setIsLoading(true);
    try {
      // This would need to be updated in your backend to return events instead of slots
      const data = await PresentationService.getHostSlots();
      
      // For now, we'll treat the existing slots as events
      // In a real implementation, you'd have a separate API endpoint for events
      setEvents(data);
    } catch (error) {
      console.error('Error fetching presentation events:', error);
      toast.error('Failed to load your presentation events');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize edit mode with event data
  const initializeEditMode = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };
  
  // View event details
  const viewEvent = (event) => {
    setViewEventDetails(event);
  };
  
  // Cancel edit mode
  const cancelEdit = () => {
    setEditingEvent(null);
    resetForm();
    setShowForm(false);
  };
  
  // Reset form state
  const resetForm = () => {
    setEditingEvent(null);
  };

  // Show delete confirmation
  const handleConfirmDelete = (eventId) => {
    setEventToDelete(eventId);
    setShowDeleteConfirm(true);
  };
  
  // Delete event and its slots
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      // Find the event details to get the title
      const eventToDeleteObj = events.find(event => event._id === eventToDelete);
      if (!eventToDeleteObj) {
        throw new Error('Could not find event to delete');
      }
      
      let deletionSuccessful = false;
      
      // Try bulk deletion first
      try {
        const result = await PresentationService.deleteSlotsByTitle(eventToDeleteObj.title);
        deletionSuccessful = result && result.deletedCount > 0;
      } catch (bulkDeleteError) {
        // Fallback: Delete each slot individually
        try {
          const eventSlots = await PresentationService.getSlotsByEventId(eventToDeleteObj.title);
          
          if (eventSlots && eventSlots.length > 0) {
            let successCount = 0;
            
            for (const slot of eventSlots) {
              try {
                await PresentationService.deleteSlot(slot._id);
                successCount++;
              } catch (err) {
                // Continue with next slot
              }
            }
            
            deletionSuccessful = successCount > 0;
            
            if (successCount > 0 && successCount < eventSlots.length) {
              toast.warning(`Partially deleted: ${successCount} out of ${eventSlots.length} slots removed.`);
            }
          }
        } catch (fallbackError) {
          // Final fallback failed
        }
      }
      
      if (deletionSuccessful) {
        setEvents(prev => prev.filter(event => event._id !== eventToDelete));
        toast.success('Presentation event deleted successfully');
        setTimeout(() => fetchPresentationEvents(), 500);
      } else {
        throw new Error('Could not delete any slots for this event');
      }
    } catch (error) {
      toast.error('Failed to delete presentation event');
    } finally {
      setShowDeleteConfirm(false);
    }
  };
  
  // Create or update a presentation event with multiple slots
  const createPresentationEvent = async (batchCreateData, editingEvent) => {
    setIsSubmitting(true);
    
    try {
      // Delete existing slots if editing
      if (editingEvent) {
        await deleteExistingSlots();
      }
      
      // Create the new slots
      const createdSlots = await PresentationService.createBatchSlots(batchCreateData);
      
      console.log(`Created ${createdSlots.length} slots`);
      
      // Refresh, reset form and hide it
      await fetchPresentationEvents();
      resetForm();
      setShowForm(false);
      
      toast.success(
        editingEvent 
          ? `Updated presentation event with ${createdSlots.length} slots` 
          : `Created presentation event with ${createdSlots.length} slots`
      );
    } catch (error) {
      console.error('Error creating/updating presentation event:', error);
      
      let errorMessage = 'Failed to save presentation event';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete existing slots when editing an event
  const deleteExistingSlots = async () => {
    try {
      const existingSlots = await PresentationService.getEventSlots(editingEvent.title);
      
      if (existingSlots && existingSlots.length > 0) {
        // Delete each slot individually
        await Promise.all(
          existingSlots
            .filter(slot => slot.status === 'available')
            .map(slot => PresentationService.deleteSlot(slot._id))
        );
      }
    } catch (error) {
      console.error('Error deleting existing slots:', error);
      toast.warning('Some existing slots could not be deleted');
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 py-8 w-full"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-teal-200">
          <div className="p-8 bg-gradient-to-r from-teal-600 to-emerald-500">
            <h1 className="text-3xl font-bold text-white">Presentation Events</h1>
            <p className="text-teal-50 mt-2">Create and manage presentation events for students</p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold text-gray-800">My Presentations</h2>
                <p className="text-gray-600">Manage your presentation events and time slots</p>
              </div>
              
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Presentation
              </button>
            </div>
            
            {isLoading ? (
              <div className="w-full flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-teal-300 rounded-lg bg-teal-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-teal-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No Presentation Events</h3>
                <p className="text-gray-600 mb-6">You haven't created any presentation events yet.</p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md"
                >
                  Create Your First Presentation
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                  <div 
                    key={event._id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-teal-100 hover:shadow-lg transition-shadow"
                  >
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-400 px-4 py-3">
                      <h3 className="text-lg font-medium text-white truncate">{event.title}</h3>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-gray-600 mb-3 text-sm line-clamp-2 min-h-[40px]">{event.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gray-50 p-2 rounded text-sm">
                          <span className="text-gray-500 block">Venue:</span>
                          <span className="font-medium">{event.venue}</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-sm">
                          <span className="text-gray-500 block">Duration:</span>
                          <span className="font-medium">{event.duration} min</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-sm">
                          <span className="text-gray-500 block">Type:</span>
                          <span className="font-medium">
                            {event.presentationType === 'single' ? 'Individual' : 'Team'}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-sm">
                          <span className="text-gray-500 block">Audience:</span>
                          <span className="font-medium">{event.targetYear}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 font-medium">Slots:</span>
                        <span className="bg-teal-100 text-teal-800 text-xs font-medium py-1 px-2 rounded-full">
                          {event.slots ? event.slots.length : 0} slots
                        </span>
                      </div>
                      
                      <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => viewEvent(event)}
                          className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          View Details
                        </button>
                        
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => initializeEditMode(event)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleConfirmDelete(event._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Form Component */}
        {showForm && (
          <PresentationForm
            editingEvent={editingEvent}
            onCancel={cancelEdit}
            onSave={createPresentationEvent}
            isSubmitting={isSubmitting}
          />
        )}
        
        {/* Event Details Modal */}
        {viewEventDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-4xl w-full p-0 shadow-2xl">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-500 p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">{viewEventDetails.title}</h3>
                  <button
                    onClick={() => setViewEventDetails(null)}
                    className="text-white hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-6">{viewEventDetails.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-sm block">Venue</span>
                    <span className="font-medium">{viewEventDetails.venue}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-sm block">Duration</span>
                    <span className="font-medium">{viewEventDetails.duration} minutes</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-sm block">Type</span>
                    <span className="font-medium">
                      {viewEventDetails.presentationType === 'single' ? 'Individual' : 'Team'}
                      {viewEventDetails.presentationType === 'team' && viewEventDetails.minTeamMembers && viewEventDetails.maxTeamMembers && 
                        ` (${viewEventDetails.minTeamMembers}-${viewEventDetails.maxTeamMembers} members)`}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-sm block">Target Year</span>
                    <span className="font-medium">{viewEventDetails.targetYear}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-sm block">School</span>
                    <span className="font-medium">{viewEventDetails.targetSchool}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500 text-sm block">Department</span>
                    <span className="font-medium">{viewEventDetails.targetDepartment}</span>
                  </div>
                </div>
                
                <h4 className="text-lg font-medium text-gray-800 mb-3">Time Slots</h4>
                
                {viewEventDetails.slots && viewEventDetails.slots.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {viewEventDetails.slots.map(slot => (
                          <tr key={slot._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(slot.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {slot.startTime} - {slot.endTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${slot.status === 'available' ? 'bg-green-100 text-green-800' : 
                                  slot.status === 'booked' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-red-100 text-red-800'}`}>
                                {slot.status === 'available' ? 'Available' : 
                                  slot.status === 'booked' ? 'Booked' : 'Cancelled'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                    <p className="text-gray-500">No time slots available for this presentation</p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setViewEventDetails(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this presentation event? This will remove all associated time slots and cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-md disabled:opacity-75"
                  onClick={handleDeleteEvent}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HostPresentation;
