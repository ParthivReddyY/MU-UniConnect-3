import api from '../utils/axiosConfig';

class PresentationService {
  // Get all available presentation events - improved with better error handling and logging
  async getAvailableEvents() {
    try {
      console.log('Fetching available events with grouping');
      const response = await api.get('/api/presentation-slots/available', {
        params: { grouped: 'true' }
      });
      console.log('Available events response:', response.status);
      console.log('Event count:', response.data ? response.data.length : 0);
      
      // Debug host data in first event if available
      if (response.data && response.data.length > 0) {
        console.log('Sample event host data:', response.data[0].host);
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching available events:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      throw error;
    }
  }

  // Get all slots for an event by event title (used as grouping identifier)
  async getSlotsByEventId(eventTitle) {
    try {
      console.log(`Fetching slots for event "${eventTitle}"`);
      const response = await api.get('/api/presentation-slots/available', {
        params: { title: eventTitle, status: 'available' }
      });
      console.log('Slots response:', response.status);
      console.log('Slots count:', response.data ? response.data.length : 0);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching slots for event "${eventTitle}":`, error);
      console.error('Error details:', error.response?.data || 'No response data');
      throw error;
    }
  }

  // Get a specific slot by ID
  async getSlotById(slotId) {
    try {
      const response = await api.get(`/api/presentation-slots/${slotId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching slot ${slotId}:`, error);
      throw error;
    }
  }

  // Book a presentation slot with enhanced logging for debugging
  async bookSlot(bookingData) {
    try {
      console.log('Booking slot with data:', JSON.stringify(bookingData, null, 2));
      const slotId = bookingData.slotId;
      const response = await api.post(`/api/presentation-slots/${slotId}/book`, bookingData);
      console.log('Booking response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error booking slot:', error);
      throw error;
    }
  }
  
  // New method to book a presentation slot with file attachments
  async bookSlotWithAttachments(slotId, formData) {
    try {
      console.log('Booking slot with attachments, slot ID:', slotId);
      const response = await api.post(
        `/api/presentation-slots/${slotId}/book-with-attachments`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      console.log('Booking with attachments response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error booking slot with attachments:', error);
      throw error;
    }
  }

  // Get user's booked slots
  async getUserBookings() {
    try {
      const response = await api.get('/api/presentation-slots/student-bookings');
      
      // Debug host data in bookings
      if (response.data && response.data.length > 0) {
        console.log('Sample booking host data:', response.data[0].slot.host);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  }

  // Cancel a booked slot
  async cancelBooking(slotId) {
    try {
      const response = await api.post(`/api/presentation-slots/${slotId}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Error cancelling booking ${slotId}:`, error);
      throw error;
    }
  }

  // Get host's presentation slots
  async getHostSlots() {
    try {
      const response = await api.get('/api/presentation-slots/host', {
        params: { grouped: 'true' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching host slots:', error);
      throw error;
    }
  }

  // Get all slots for a specific event (for host)
  async getEventSlots(title) {
    try {
      const response = await api.get('/api/presentation-slots/host', {
        params: { title }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching slots for event "${title}":`, error);
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

  // Create batch slots
  async createBatchSlots(batchData) {
    try {
      const response = await api.post('/api/presentation-slots/batch', batchData);
      return response.data;
    } catch (error) {
      console.error('Error creating batch slots:', error);
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

  // Delete a slot
  async deleteSlot(slotId) {
    try {
      const response = await api.delete(`/api/presentation-slots/${slotId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting slot ${slotId}:`, error);
      throw error;
    }
  }

  // Delete slots by title (bulk delete)
  async deleteSlotsByTitle(title) {
    try {
      const response = await api.post('/api/presentation-slots/delete-by-title', { title });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

const presentationService = new PresentationService();
export default presentationService;