const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateUser } = require('../middleware/auth');
const imageHandler = require('../utils/imageHandler');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

/**
 * @route POST /api/upload/image
 * @desc Upload an image file
 * @access Private
 */
router.post('/image', authenticateUser, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Process the uploaded image
    const imageUrl = await imageHandler.processUploadedImage(req.file, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 85
    });
    
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
});

/**
 * @route POST /api/upload/imageUrl
 * @desc Process an image from a URL
 * @access Private
 */
router.post('/imageUrl', authenticateUser, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'No image URL provided' });
    }
    
    // Process the image from URL
    const processedImageUrl = await imageHandler.processImageFromUrl(imageUrl, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 85
    });
    
    res.status(200).json({
      message: 'Image processed successfully',
      imageUrl: processedImageUrl
    });
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ message: 'Failed to process image URL', error: error.message });
  }
});

/**
 * @route DELETE /api/upload/image
 * @desc Delete an image file
 * @access Private
 */
router.delete('/image', authenticateUser, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'No image URL provided' });
    }
    
    const deleted = await imageHandler.deleteImage(imageUrl);
    
    if (deleted) {
      return res.status(200).json({ message: 'Image deleted successfully' });
    } else {
      return res.status(404).json({ message: 'Image not found or could not be deleted' });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
});

module.exports = router;
