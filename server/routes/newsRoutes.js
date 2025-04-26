const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getAllNews,
  getNewsById,
  getNewsByCategory,
  getFeaturedNews,
  createNews,
  updateNews,
  deleteNews
} = require('../controllers/newsController');

// Public routes
router.get('/', getAllNews);
router.get('/featured', getFeaturedNews);
router.get('/category/:category', getNewsByCategory);
router.get('/:id', getNewsById);

// Protected routes (admin only)
router.post('/', authenticateUser, createNews);
router.put('/:id', authenticateUser, updateNews);
router.delete('/:id', authenticateUser, deleteNews);

module.exports = router;