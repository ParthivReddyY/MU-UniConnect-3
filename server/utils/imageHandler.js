const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { promisify } = require('util');
const { pipeline } = require('stream');
const streamPipeline = promisify(pipeline);
const fetch = require('node-fetch');
const config = require('../config/config');

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
  }
};

module.exports = imageHandler;
