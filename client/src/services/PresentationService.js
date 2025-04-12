import axios from '../utils/axiosConfig';

const PresentationService = {
  // Get all slots created by the logged-in host (faculty/club head)
  getHostSlots: async () => {
    try {
      const response = await axios.get('/api/presentation-slots/host');
      return response.data;
    } catch (error) {
      console.error('Error fetching host slots:', error);
      throw error;
    }
  },

  // Create a new presentation slot
  createSlot: async (slotData) => {
    try {
      const response = await axios.post('/api/presentation-slots', slotData);
      return response.data;
    } catch (error) {
      console.error('Error creating presentation slot:', error);
      throw error;
    }
  },

  // Create multiple slots in batch
  createBatchSlots: async (batchData) => {
    try {
      const response = await axios.post('/api/presentation-slots/batch', batchData);
      return response.data;
    } catch (error) {
      console.error('Error creating batch presentation slots:', error);
      throw error;
    }
  },

  // Update an existing slot
  updateSlot: async (slotId, updatedData) => {
    try {
      const response = await axios.put(`/api/presentation-slots/${slotId}`, updatedData);
      return response.data;
    } catch (error) {
      console.error('Error updating presentation slot:', error);
      throw error;
    }
  },

  // Delete a slot
  deleteSlot: async (slotId) => {
    try {
      const response = await axios.delete(`/api/presentation-slots/${slotId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting presentation slot:', error);
      throw error;
    }
  },

  // Get available slots for students to book, with optional filters
  getAvailableSlots: async (filters = {}) => {
    try {
      const response = await axios.get('/api/presentation-slots/available', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching available presentation slots:', error);
      throw error;
    }
  },

  // Get a specific slot by ID
  getSlotById: async (slotId) => {
    try {
      const response = await axios.get(`/api/presentation-slots/${slotId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching presentation slot:', error);
      throw error;
    }
  },

  // Book a presentation slot
  bookSlot: async (slotId, bookingData = {}) => {
    try {
      const response = await axios.post(`/api/presentation-slots/${slotId}/book`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error booking presentation slot:', error);
      throw error;
    }
  },

  // Cancel a booking
  cancelBooking: async (slotId) => {
    try {
      const response = await axios.post(`/api/presentation-slots/${slotId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error canceling presentation slot booking:', error);
      throw error;
    }
  },

  // Get all bookings made by the logged-in student
  getStudentBookings: async () => {
    try {
      const response = await axios.get('/api/presentation-slots/student-bookings');
      return response.data;
    } catch (error) {
      console.error('Error fetching student bookings:', error);
      throw error;
    }
  }
};

export default PresentationService;