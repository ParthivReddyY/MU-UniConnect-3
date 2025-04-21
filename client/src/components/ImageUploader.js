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
  
  const handleClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    
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

  return (
    <div>
      {imagePreview && (
        <div className="mb-3">
          <img 
            src={imagePreview}
            alt="Preview"
            className="max-h-40 rounded-md shadow-sm"
          />
        </div>
      )}
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
        className={`flex items-center justify-center ${buttonStyle || 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition-colors'}`}
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
  );
});

ImageUploader.propTypes = {
  initialImage: PropTypes.string,
  onImageChange: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
  defaultImage: PropTypes.string,
  buttonStyle: PropTypes.string,
  children: PropTypes.node
}; // Fixed missing parenthesis

export default ImageUploader;
