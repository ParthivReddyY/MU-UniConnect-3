import axios from '../utils/axiosConfig';

// Get all clubs
export const getAllClubs = async () => {
  try {
    const response = await axios.get('/api/clubs');
    return response.data;
  } catch (error) {
    console.error('Error fetching clubs:', error);
    throw error;
  }
};

// Get a club by ID
export const getClubById = async (id) => {
  try {
    const response = await axios.get(`/api/clubs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching club with ID ${id}:`, error);
    throw error;
  }
};

// Create a new club
export const createClub = async (clubData) => {
  try {
    const response = await axios.post('/api/clubs', clubData);
    return response.data;
  } catch (error) {
    console.error('Error creating club:', error);
    throw error;
  }
};

// Update a club
export const updateClub = async (id, clubData) => {
  try {
    // Change from patch to put to use our enhanced endpoint that properly handles emails
    const response = await axios.put(`/api/clubs/${id}`, clubData);
    return response.data;
  } catch (error) {
    console.error(`Error updating club with ID ${id}:`, error);
    throw error;
  }
};

// Delete a club
export const deleteClub = async (id) => {
  try {
    const response = await axios.delete(`/api/clubs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting club with ID ${id}:`, error);
    throw error;
  }
};

// Get clubs by category
export const getClubsByCategory = async (category) => {
  try {
    const response = await axios.get(`/api/clubs/category/${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching clubs with category ${category}:`, error);
    throw error;
  }
};

// Add an event to a club
export const addEventToClub = async (clubId, eventData) => {
  try {
    const response = await axios.post(`/api/clubs/${clubId}/events`, eventData);
    return response.data;
  } catch (error) {
    console.error(`Error adding event to club with ID ${clubId}:`, error);
    throw error;
  }
};

// Delete an event from a club
export const deleteEventFromClub = async (clubId, eventId) => {
  try {
    const response = await axios.delete(`/api/clubs/${clubId}/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting event ${eventId} from club ${clubId}:`, error);
    throw error;
  }
};

// Verify club head credentials
export const verifyClubHeadCredentials = async (email, clubId) => {
  try {
    const response = await axios.post('/api/auth/verify-club-head', { email, clubId });
    return response.data;
  } catch (error) {
    console.error(`Error verifying club head credentials:`, error);
    throw error;
  }
};

// Get clubs managed by current user
export const getMyManagedClubs = async () => {
  try {
    const response = await axios.get('/api/clubs/managed');
    return response.data;
  } catch (error) {
    console.error('Error fetching managed clubs:', error);
    throw error;
  }
};