const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { promisify } = require('util');
const { pipeline } = require('stream');
const streamPipeline = promisify(pipeline);
const fetch = require('node-fetch');
const config = require('../config/config');
const unlinkAsync = promisify(fs.unlink);

/**
 * Image Handler Utility
 * Handles image uploading, processing, and storage
 */
const imageHandler = {
  /**
   * Process and save an uploaded image file
   * @param {Object} file - The file object from multer
   * @param {Object} options - Processing options
   * @returns {Promise<String>} - URL path to the saved image
   */
  async processUploadedImage(file, options = {}) {
    try {
      // Generate a unique file name to prevent overwriting
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const uniqueFilename = crypto.randomBytes(16).toString('hex') + fileExtension;
      const relativePath = `/uploads/images/${uniqueFilename}`;
      const outputPath = path.join(__dirname, '../public', relativePath);
      
      // Create directory if it doesn't exist
      const dirPath = path.dirname(outputPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Default options for image processing
      const defaultOptions = {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 80,
        format: 'webp'
      };
      
      // Merge default options with provided options
      const processingOptions = { ...defaultOptions, ...options };
      
      // Process the image using Sharp
      await sharp(file.buffer)
        .resize({
          width: processingOptions.maxWidth,
          height: processingOptions.maxHeight,
          fit: sharp.fit.inside,
          withoutEnlargement: true
        })
        .toFormat(processingOptions.format, { quality: processingOptions.quality })
        .toFile(outputPath);
      
      // Return the URL path to the image
      return `${config.baseUrl}${relativePath}`;
    } catch (error) {
      console.error('Error processing uploaded image:', error);
      throw new Error('Failed to process image');
    }
  },
  
  /**
   * Download and process an image from a URL
   * @param {String} imageUrl - The URL of the image to download
   * @param {Object} options - Processing options
   * @returns {Promise<String>} - URL path to the saved image
   */
  async processImageFromUrl(imageUrl, options = {}) {
    try {
      // Fetch the image from the URL
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      // Generate a unique file name
      const urlPathname = new URL(imageUrl).pathname;
      const fileExtension = path.extname(urlPathname).toLowerCase() || '.jpg';
      const uniqueFilename = crypto.randomBytes(16).toString('hex') + fileExtension;
      const relativePath = `/uploads/images/${uniqueFilename}`;
      const outputPath = path.join(__dirname, '../public', relativePath);
      
      // Create directory if it doesn't exist
      const dirPath = path.dirname(outputPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Default options for image processing
      const defaultOptions = {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 80,
        format: 'webp'
      };
      
      // Merge default options with provided options
      const processingOptions = { ...defaultOptions, ...options };
      
      // Process the image using Sharp
      const transformer = sharp()
        .resize({
          width: processingOptions.maxWidth,
          height: processingOptions.maxHeight,
          fit: sharp.fit.inside,
          withoutEnlargement: true
        })
        .toFormat(processingOptions.format, { quality: processingOptions.quality });
      
      await streamPipeline(response.body, transformer, fs.createWriteStream(outputPath));
      
      // Return the URL path to the image
      return `${config.baseUrl}${relativePath}`;
    } catch (error) {
      console.error('Error processing image from URL:', error);
      throw new Error('Failed to process image from URL');
    }
  },
  
  /**
   * Process a data URL (base64 encoded image)
   * @param {String} dataUrl - The data URL to process
   * @param {Object} options - Processing options
   * @returns {Promise<String>} - URL path to the saved image
   */
  async processDataUrl(dataUrl, options = {}) {
    try {
      // Extract the base64 data from the data URL
      const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid data URL format');
      }
      
      const imageBuffer = Buffer.from(matches[2], 'base64');
      const uniqueFilename = crypto.randomBytes(16).toString('hex') + '.webp';
      const relativePath = `/uploads/images/${uniqueFilename}`;
      const outputPath = path.join(__dirname, '../public', relativePath);
      
      // Create directory if it doesn't exist
      const dirPath = path.dirname(outputPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Default options for image processing
      const defaultOptions = {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 80,
        format: 'webp'
      };
      
      // Merge default options with provided options
      const processingOptions = { ...defaultOptions, ...options };
      
      // Process the image using Sharp
      await sharp(imageBuffer)
        .resize({
          width: processingOptions.maxWidth,
          height: processingOptions.maxHeight,
          fit: sharp.fit.inside,
          withoutEnlargement: true
        })
        .toFormat(processingOptions.format, { quality: processingOptions.quality })
        .toFile(outputPath);
      
      // Return the URL path to the image
      return `${config.baseUrl}${relativePath}`;
    } catch (error) {
      console.error('Error processing data URL:', error);
      throw new Error('Failed to process data URL');
    }
  },
  
  /**
   * Delete an image file
   * @param {String} imageUrl - The URL of the image to delete
   * @returns {Promise<Boolean>} - Whether the deletion was successful
   */
  async deleteImage(imageUrl) {
    try {
      // Only delete images from our own server
      if (!imageUrl || !imageUrl.startsWith(config.baseUrl)) {
        return false;
      }
      
      const relativePath = imageUrl.replace(config.baseUrl, '');
      const filePath = path.join(__dirname, '../public', relativePath);
      
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  },
  
  /**
   * Fetch an image from a URL and save it locally
   * @param {string} imageUrl - External image URL to fetch
   * @returns {Promise<string|null>} - Local URL of saved image or null if failed
   */
  fetchAndSaveExternalImage: async (imageUrl) => {
    try {
      if (!imageUrl) return null;
      
      // Generate a unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const extension = imageUrl.split('.').pop().split('?')[0] || 'jpg';
      const filename = `external_${timestamp}_${randomString}.${extension}`;
      
      // Fetch the image
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      // Create directory if it doesn't exist
      const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'images');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Save the image to disk
      const imagePath = path.join(uploadDir, filename);
      const buffer = await response.buffer();
      fs.writeFileSync(imagePath, buffer);
      
      // Return the new local URL
      return `/uploads/images/${filename}`;
    } catch (error) {
      console.error('Error fetching external image:', error);
      return null;
    }
  }
};

module.exports = imageHandler;
