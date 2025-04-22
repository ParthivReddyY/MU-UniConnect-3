import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Image Uploader component with preview
 */
const ImageUploader = forwardRef(({ 
  initialImage = null, 
  onImageChange, 
  buttonText = 'Change Photo',
  defaultImage = null,
  buttonStyle = '',
  children = null
}, ref) => {
  const [imagePreview, setImagePreview] = useState(initialImage || defaultImage);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [urlInput, setUrlInput] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      setErrorMessage('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    setErrorMessage('');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImagePreview(dataUrl);
      
      // Pass image data to parent component
      if (onImageChange) {
        onImageChange({
          type: 'file',
          file: file,
          dataUrl: dataUrl
        });
      }
      
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };
  
  // Handle URL input submission
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMessage('Please enter an image URL');
      return;
    }
    
    setIsUploading(true);
    setErrorMessage('');
    
    // Create image object to check if URL is valid
    const img = new Image();
    img.onload = () => {
      setImagePreview(urlInput);
      if (onImageChange) {
        onImageChange({
          type: 'url',
          url: urlInput
        });
      }
      setIsUploading(false);
    };
    
    img.onerror = () => {
      setErrorMessage('Invalid image URL or image not accessible');
      setIsUploading(false);
    };
    
    img.src = urlInput;
  };
  
  // Allow setting image from URL
  const setImageFromUrl = (url) => {
    setImagePreview(url);
    if (onImageChange) {
      onImageChange({
        type: 'url',
        url: url
      });
    }
  };

  // Expose the setImageFromUrl method to parent components
  useImperativeHandle(ref, () => ({
    setImageFromUrl
  }));
  
  // Reset the image to default
  const handleResetImage = () => {
    setImagePreview(defaultImage);
    setUrlInput('');
    if (onImageChange) {
      onImageChange({
        type: 'reset',
        url: defaultImage
      });
    }
  };

  return (
    <div className="image-uploader-container">
      {/* Preview section with improved styling */}
      {imagePreview && (
        <div className="mb-3 relative rounded-md overflow-hidden shadow-md border border-gray-200 transition-all hover:shadow-lg group">
          <img 
            src={imagePreview}
            alt="Preview"
            className="max-h-48 max-w-full object-cover mx-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ccircle cx='50' cy='35' r='20' fill='%23d1d5db'/%3E%3Crect x='25' y='65' width='50' height='25' rx='10' fill='%23d1d5db'/%3E%3C/svg%3E";
            }}
          />
          
          {/* Image reset button overlay */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleResetImage}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 text-red-500 hover:text-red-600 p-1 rounded-full shadow-sm"
              title="Reset image"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
      
      {/* Toggle for upload methods */}
      <div className="flex items-center justify-center space-x-2 mb-3">
        <button
          type="button"
          onClick={() => setUploadMethod('file')}
          className={`text-sm px-3 py-1.5 rounded-md transition-all ${
            uploadMethod === 'file' 
              ? 'bg-indigo-100 text-indigo-700 font-medium' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <i className="fas fa-upload mr-1.5"></i>Upload
        </button>
        <button
          type="button"
          onClick={() => setUploadMethod('url')}
          className={`text-sm px-3 py-1.5 rounded-md transition-all ${
            uploadMethod === 'url' 
              ? 'bg-indigo-100 text-indigo-700 font-medium' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <i className="fas fa-link mr-1.5"></i>URL
        </button>
      </div>
      
      {/* Error message display */}
      {errorMessage && (
        <div className="mb-3 text-red-500 text-sm bg-red-50 p-2 rounded-md">
          <i className="fas fa-exclamation-circle mr-1"></i> {errorMessage}
        </div>
      )}
      
      {/* File upload option */}
      {uploadMethod === 'file' && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className={`flex items-center justify-center w-full ${buttonStyle || 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition-colors'}`}
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : children || (
              <span className="flex items-center">
                <i className="fas fa-camera mr-2"></i>
                {buttonText}
              </span>
            )}
          </button>
        </div>
      )}
      
      {/* URL input option */}
      {uploadMethod === 'url' && (
        <form onSubmit={handleUrlSubmit} className="w-full flex space-x-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isUploading}
          />
          <button
            type="submit"
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading
              </span>
            ) : (
              <span className="flex items-center">
                <i className="fas fa-arrow-right"></i>
              </span>
            )}
          </button>
        </form>
      )}
    </div>
  );
});

ImageUploader.propTypes = {
  initialImage: PropTypes.string,
  onImageChange: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
  defaultImage: PropTypes.string,
  buttonStyle: PropTypes.string,
  children: PropTypes.node
};

export default ImageUploader;
