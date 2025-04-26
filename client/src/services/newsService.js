import axios from '../utils/axiosConfig';

/**
 * Get all news items
 * @returns {Promise<Array>} Array of news items
 */
export const getAllNews = async () => {
  try {
    const response = await axios.get('/api/news');
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

/**
 * Get news by category
 * @param {string} category - Category to filter by
 * @returns {Promise<Array>} Array of filtered news items
 */
export const getNewsByCategory = async (category) => {
  try {
    const response = await axios.get(`/api/news/category/${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news by category ${category}:`, error);
    throw error;
  }
};

/**
 * Get featured news
 * @returns {Promise<Array>} Array of featured news items
 */
export const getFeaturedNews = async () => {
  try {
    const response = await axios.get('/api/news/featured');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured news:', error);
    throw error;
  }
};

/**
 * Create a new news item (admin only)
 * @param {Object} newsData - The news data to create
 * @returns {Promise<Object>} Created news item
 */
export const createNews = async (newsData) => {
  try {
    const response = await axios.post('/api/news', newsData);
    return response.data;
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
};

/**
 * Update a news item (admin only)
 * @param {string} id - ID of the news item to update
 * @param {Object} newsData - The updated news data
 * @returns {Promise<Object>} Updated news item
 */
export const updateNews = async (id, newsData) => {
  try {
    const response = await axios.put(`/api/news/${id}`, newsData);
    return response.data;
  } catch (error) {
    console.error(`Error updating news item ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a news item (admin only)
 * @param {string} id - ID of the news item to delete
 * @returns {Promise<Object>} Response data
 */
export const deleteNews = async (id) => {
  try {
    const response = await axios.delete(`/api/news/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting news item ${id}:`, error);
    throw error;
  }
};

const newsService = {
  getAllNews,
  getNewsByCategory,
  getFeaturedNews,
  createNews,
  updateNews,
  deleteNews
};

export default newsService;