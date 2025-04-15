import api from '../utils/axiosConfig';

class PresentationService {
  // Get slots created by the logged-in host
  async getHostSlots() {
    try {
      const response = await api.get('/api/presentation-slots/host', {
        params: { grouped: 'true' } // Request events grouped by title
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Get all slots for a specific event by title
  async getEventSlots(title) {
    try {
      const response = await api.get('/api/presentation-slots/host', {
        params: { title }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Create a new slot
  async createSlot(slotData) {
    try {
      const response = await api.post('/api/presentation-slots', slotData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Create multiple slots in batch - complete rewrite to fix duplication issue
  async createBatchSlots(batchData) {
    try {
      console.log('Creating slots with specific day-time pairings:', {
        dateCount: batchData.dates.length,
        timeSlotCount: batchData.timeSlots.length,
        title: batchData.commonData.title
      });

      // Validate team presentation data
      if (batchData.commonData.presentationType === 'team') {
        if (!batchData.commonData.minTeamMembers || batchData.commonData.minTeamMembers < 2) {
          batchData.commonData.minTeamMembers = 2;
        }
        if (!batchData.commonData.maxTeamMembers || batchData.commonData.maxTeamMembers < batchData.commonData.minTeamMembers) {
          batchData.commonData.maxTeamMembers = batchData.commonData.minTeamMembers;
        }
      }

      // Store created slots
      const createdSlots = [];
      
      // Group time slots by day of week
      const timeSlotsByDay = {};
      batchData.timeSlots.forEach(slot => {
        if (!slot.dayOfWeek && slot.dayOfWeek !== 0) {
          console.error('Time slot missing dayOfWeek property:', slot);
          return;
        }
        
        if (!timeSlotsByDay[slot.dayOfWeek]) {
          timeSlotsByDay[slot.dayOfWeek] = [];
        }
        
        timeSlotsByDay[slot.dayOfWeek].push({
          startTime: slot.startTime,
          endTime: slot.endTime
        });
      });
      
      console.log('Time slots grouped by day:', timeSlotsByDay);
      
      // Process each date and only apply time slots for matching day of week
      for (const dateStr of batchData.dates) {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Get time slots for this day of week
        const timeSlotsForDay = timeSlotsByDay[dayOfWeek] || [];
        
        if (timeSlotsForDay.length === 0) {
          console.log(`No time slots defined for ${dateStr} (day ${dayOfWeek}), skipping`);
          continue;
        }
        
        console.log(`Creating ${timeSlotsForDay.length} slots for ${dateStr} (day ${dayOfWeek})`);
        
        // Create a slot for each time slot on this day
        for (const timeSlot of timeSlotsForDay) {
          try {
            // Create each slot individually with explicit date-time pairing
            const slotData = {
              ...batchData.commonData,
              date: dateStr,
              startTime: timeSlot.startTime,
              endTime: timeSlot.endTime
            };
            
            // Log what we're about to create
            console.log(`Creating slot: ${dateStr} at ${timeSlot.startTime}-${timeSlot.endTime}`);
            
            // Create the slot
            const newSlot = await this.createSlot(slotData);
            createdSlots.push(newSlot);
          } catch (error) {
            console.error(`Error creating slot for ${dateStr} at ${timeSlot.startTime}:`, error);
          }
        }
      }
      
      console.log(`Successfully created ${createdSlots.length} slots`);
      return createdSlots;
    } catch (error) {
      console.error("Batch slot creation failed:", error);
      throw error;
    }
  }
  
  // Update a slot
  async updateSlot(slotId, updateData) {
    try {
      const response = await api.put(`/api/presentation-slots/${slotId}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Delete a slot - improved with better error handling and verification
  async deleteSlot(slotId) {
    try {
      // Log the deletion attempt
      console.log(`Attempting to delete slot with ID: ${slotId}`);
      
      const response = await api.delete(`/api/presentation-slots/${slotId}`);
      
      // Verify successful deletion
      if (response.status !== 200) {
        throw new Error(`Server returned unexpected status: ${response.status}`);
      }
      
      console.log(`Successfully deleted slot: ${slotId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting slot:', error);
      
      // Provide more specific error message if available
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(`Server deletion error: ${error.response.data.message}`);
      }
      throw error; // Re-throw the error to be handled by the caller
    }
  }
  
  // Delete slots by title - improved with better error handling
  async deleteSlotsByTitle(title) {
    try {
      console.log(`Attempting to delete all slots with title: "${title}"`);
      
      const response = await api.post('/api/presentation-slots/delete-by-title', { title });
      
      // Verify successful deletion
      if (response.status !== 200) {
        throw new Error(`Server returned unexpected status: ${response.status}`);
      }
      
      console.log(`Successfully deleted slots with title "${title}": ${response.data.deletedCount} slots removed`);
      return response.data;
    } catch (error) {
      console.error('Error deleting slots by title:', error);
      
      // Provide more specific error message if available
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(`Server deletion error: ${error.response.data.message}`);
      }
      throw error; // Re-throw the error to be handled by the caller
    }
  }
  
  // Get available slots for booking
  async getAvailableSlots() {
    try {
      const response = await api.get('/api/presentation-slots/available');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Book a slot
  async bookSlot(bookingData) {
    try {
      const response = await api.post(`/api/presentation-slots/${bookingData.slotId}/book`, bookingData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Get user's bookings
  async getUserBookings() {
    try {
      const response = await api.get('/api/presentation-slots/student-bookings');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Cancel a booking
  async cancelBooking(slotId) {
    try {
      const response = await api.post(`/api/presentation-slots/${slotId}/cancel`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Get slots by event ID (title) - for updating purposes
  async getSlotsByEventId(eventId) {
    try {
      // First get the event's title from the provided event
      let title;
      try {
        // Try to get the event directly first
        const event = await api.get(`/api/presentation-slots/${eventId}`);
        title = event.data.title;
      } catch (err) {
        // If that fails, assume the eventId is actually a title
        title = eventId;
      }
      
      // Then get all slots with the same title
      const response = await api.get('/api/presentation-slots/host', {
        params: { title: title }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching slots by event ID:', error);
      throw error;
    }
  }
}

const presentationService = new PresentationService();
export default presentationService;