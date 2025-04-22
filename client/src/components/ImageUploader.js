import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced Image Uploader component with better preview and validation
 */
const ImageUploader = forwardRef(({ 
  initialImage = null, 
  onImageChange, 
  buttonText = 'Change Photo',
  defaultImage = null,
  maxSizeInMB = 5,
  allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  imagePlaceholder = "No image selected"
}, ref) => {
  const [imagePreview, setImagePreview] = useState(initialImage || defaultImage);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [urlInput, setUrlInput] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Reset image preview when initialImage changes
  useEffect(() => {
    if (initialImage !== undefined && initialImage !== null) {
      setImagePreview(initialImage);
    } else if (defaultImage) {
      setImagePreview(defaultImage);
    }
    setErrorMessage('');
  }, [initialImage, defaultImage]);
  
  const handleClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Clear previous errors
    setErrorMessage('');
    
    // Check file type
    if (!allowedFileTypes.includes(file.type)) {
      setErrorMessage(`Please select a valid image type (${allowedFileTypes.map(type => type.split('/')[1]).join(', ')})`);
      return;
    }
    
    // Check file size (max provided in MB)
    if (file.size > maxSizeInMB * 1024 * 1024) {
      setErrorMessage(`Image size should be less than ${maxSizeInMB}MB`);
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 20;
      setUploadProgress(Math.min(progress, 90));
      if (progress >= 90) clearInterval(progressInterval);
    }, 100);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImagePreview(dataUrl);
      
      // Complete upload simulation
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Pass image data to parent component
      if (onImageChange) {
        onImageChange({
          type: 'file',
          file: file,
          dataUrl: dataUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        });
      }
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    };
    
    reader.onerror = () => {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      setErrorMessage('Error reading file. Please try again.');
    };
    
    reader.readAsDataURL(file);
  };

  // Function to check if a URL might have CORS issues
  const isCORSSensitiveURL = (url) => {
    try {
      const urlObj = new URL(url);
      // Check if URL is from a different origin than our app
      return urlObj.origin !== window.location.origin && 
             !url.startsWith('data:') && 
             !url.startsWith('blob:');
    } catch (e) {
      return false;
    }
  };

  // Get a CORS-friendly URL (for preview purposes)
  const getCORSFriendlyURL = (url) => {
    if (!url) return url;
    
    try {
      const urlObj = new URL(url);
      
      // Only apply proxy for external domains
      if (urlObj.origin !== window.location.origin && 
          !url.startsWith('data:') && 
          !url.startsWith('blob:')) {
        // These are public CORS proxies - replace with your own proxy if needed
        // Note: For production, you should implement your own proxy endpoint
        const corsProxies = [
          `https://corsproxy.io/?${encodeURIComponent(url)}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
          `https://proxy.cors.sh/${url}`
        ];
        return corsProxies[0]; // Use the first proxy option
      }
      return url;
    } catch (e) {
      return url;
    }
  };
  
  // Handle URL input submission
  const handleUrlSubmit = (e) => {
    // CRITICAL FIX: Explicitly prevent the default form submission
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    const url = urlInput.trim();
    
    if (!url) {
      setErrorMessage('Please enter an image URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(url);
    } catch (error) {
      setErrorMessage('Please enter a valid URL');
      return;
    }
    
    setIsUploading(true);
    setErrorMessage('');
    
    // Create image object to check if URL is valid
    const img = new Image();
    
    // Check if URL might have CORS issues and handle accordingly
    const mayHaveCORS = isCORSSensitiveURL(url);
    
    if (mayHaveCORS) {
      // For CORS-sensitive URLs, we'll use the URL directly but warn the user
      img.crossOrigin = "Anonymous"; // Try to avoid CORS issues, though this often doesn't help
    }
    
    img.onload = () => {
      // URL is valid and image loaded successfully
      setImagePreview(url);
      
      // Pass image data to parent component
      if (onImageChange) {
        onImageChange({
          type: 'url',
          url: url, // Store the original URL even if we used a proxy for preview
          width: img.width,
          height: img.height
        });
      }
      
      setIsUploading(false);
      // Clear the input after successful upload
      setUrlInput('');
    };
    
    img.onerror = () => {
      if (mayHaveCORS) {
        // Try with a proxy for external URLs
        setErrorMessage('This image might have CORS restrictions. We will try to use it anyway.');
        
        // Pass the URL anyway - let the server or rendering component handle it
        setImagePreview(url);
        
        if (onImageChange) {
          onImageChange({
            type: 'url',
            url: url,
            hasCORSIssues: true
          });
        }
        
        setIsUploading(false);
        setUrlInput('');
      } else {
        setErrorMessage('Invalid image URL or image not accessible');
        setIsUploading(false);
      }
    };
    
    // Try loading the image with the original URL first
    img.src = url;
  };
  
  // Reset the image to default
  const handleResetImage = () => {
    setImagePreview(defaultImage);
    setUrlInput('');
    setErrorMessage('');
    
    if (onImageChange) {
      onImageChange(null);
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    resetImage: handleResetImage,
    setImageUrl: (url) => {
      setImagePreview(url);
      if (onImageChange) {
        onImageChange({
          type: 'url',
          url: url
        });
      }
    },
    getCurrentImage: () => imagePreview
  }));

  // Function to show warning for external URLs
  const renderExternalUrlWarning = () => {
    if (uploadMethod === 'url') {
      return (
        <div className="text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2 text-xs mt-2">
          <p><i className="fas fa-info-circle mr-1"></i> <strong>Note:</strong> External images from sites like Mahindra University may have CORS restrictions.</p>
          <p className="mt-1">Consider uploading the image file directly for best results.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Image preview section - simplified design */}
      <div className="mb-4">
        <div className="relative rounded-lg overflow-hidden bg-gray-50 shadow-sm hover:shadow-md transition-all w-full max-w-xs mx-auto aspect-square">
          {imagePreview ? (
            <img 
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log("Image load error. Trying fallback...");
                e.target.onerror = null; // Prevent infinite error loop
                
                if (isCORSSensitiveURL(imagePreview)) {
                  // Try with a CORS proxy as a fallback
                  const proxiedUrl = getCORSFriendlyURL(imagePreview);
                  console.log("Using proxied URL:", proxiedUrl);
                  
                  if (proxiedUrl !== imagePreview) {
                    e.target.src = proxiedUrl;
                    return;
                  }
                }
                
                // If all fails, show default image
                e.target.src = defaultImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ccircle cx='50' cy='35' r='20' fill='%23d1d5db'/%3E%3Crect x='25' y='65' width='50' height='25' rx='10' fill='%23d1d5db'/%3E%3C/svg%3E";
                
                // Only set error if this is the final fallback
                setErrorMessage('Image may be restricted by CORS policy. The image URL is saved but may not display in preview.');
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
              <div className="text-center p-4">
                <i className="fas fa-image text-3xl mb-2"></i>
                <p className="text-sm">{imagePlaceholder}</p>
              </div>
            </div>
          )}
          
          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-12 h-12 rounded-full border-2 border-white border-t-transparent animate-spin mb-2 mx-auto"></div>
                <p className="text-sm font-medium">Uploading... {uploadProgress}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Error message display - simplified */}
      {errorMessage && (
        <div className="mb-3 text-red-500 text-sm bg-red-50 p-2 rounded text-center">
          {errorMessage}
        </div>
      )}
      
      {/* Upload controls - more intuitive layout */}
      <div className="space-y-4">
        {/* Tabs for upload methods */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setUploadMethod('file')}
            className={`py-2 px-4 font-medium text-sm -mb-px ${
              uploadMethod === 'file' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={isUploading}
          >
            <i className="fas fa-upload mr-2"></i>Upload File
          </button>
          <button
            type="button"
            onClick={() => setUploadMethod('url')}
            className={`py-2 px-4 font-medium text-sm -mb-px ${
              uploadMethod === 'url' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={isUploading}
          >
            <i className="fas fa-link mr-2"></i>Image URL
          </button>
        </div>
        
        {/* File upload option */}
        {uploadMethod === 'file' && (
          <div className="text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={allowedFileTypes.join(',')}
              className="hidden"
              disabled={isUploading}
            />
            
            <button
              type="button"
              onClick={handleClick}
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full mb-2"
            >
              {isUploading ? 'Uploading...' : buttonText}
            </button>
            
            {/* File size information */}
            <p className="text-xs text-gray-500">
              Max size: {maxSizeInMB}MB • Formats: {allowedFileTypes.map(type => type.split('/')[1]).join(', ')}
            </p>
          </div>
        )}
        
        {/* URL input option - FIXED: Don't use a form element to prevent nested forms */}
        {uploadMethod === 'url' && (
          <div className="space-y-2">
            <div className="flex">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isUploading}
                // Allow pressing Enter to submit
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
              />
              <button
                type="button" // Important: Use button type=button
                onClick={handleUrlSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition-colors"
                disabled={isUploading}
              >
                {isUploading ? 'Adding...' : 'Use URL'}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Enter a direct link to an image file
            </p>
            
            {/* External URL warning */}
            {renderExternalUrlWarning()}
          </div>
        )}
        
        {/* Remove image button - only show when there's an image */}
        {imagePreview && imagePreview !== defaultImage && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleResetImage}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              <i className="fas fa-trash-alt mr-1"></i> Remove Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

ImageUploader.propTypes = {
  initialImage: PropTypes.string,
  onImageChange: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
  defaultImage: PropTypes.string,
  maxSizeInMB: PropTypes.number,
  allowedFileTypes: PropTypes.arrayOf(PropTypes.string),
  imagePlaceholder: PropTypes.string
};

export default ImageUploader;
