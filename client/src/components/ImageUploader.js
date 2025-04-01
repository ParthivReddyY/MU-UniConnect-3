import React, { useState, useRef, useEffect } from 'react';

const ImageUploader = ({ initialImage, onImageChange, defaultImage = '/img/default-faculty.png' }) => {
  // State variables
  const [image, setImage] = useState(initialImage || defaultImage);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSource, setImageSource] = useState(initialImage ? 'url' : 'default');
  const fileInputRef = useRef(null);
  
  // Update image state when initialImage prop changes
  useEffect(() => {
    if (initialImage) {
      setImage(initialImage);
      setImageSource('url');
      setImageError(false);
    } else {
      setImage(defaultImage);
      setImageSource('default');
      setImageError(false);
    }
  }, [initialImage, defaultImage]);
  
  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setImageError('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
        return;
      }
      
      // Validate file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setImageError('Image must be smaller than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setImageSource('file');
        setImageError(false);
        
        // Pass the image data to the parent component
        onImageChange && onImageChange({
          type: 'file',
          file: file,
          dataUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setImageError('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setImageError('Image must be smaller than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setImageSource('file');
        setImageError(false);
        
        // Pass the image data to the parent component
        onImageChange && onImageChange({
          type: 'file',
          file: file,
          dataUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle image URL input
  const handleUrlChange = (e) => {
    const url = e.target.value;
    if (url) {
      setImage(url);
      setImageSource('url');
      setImageError(false);
      
      // Pass the image data to the parent component
      onImageChange && onImageChange({
        type: 'url',
        url: url
      });
    } else {
      setImage(defaultImage);
      setImageSource('default');
      
      // Pass null to the parent component
      onImageChange && onImageChange(null);
    }
  };
  
  // Handle image input method toggle
  const handleMethodChange = (method) => {
    if (method === imageSource) return;
    
    if (method === 'file') {
      fileInputRef.current?.click();
      return;
    }
    
    if (method === 'url') {
      setImageSource('url');
      return;
    }
    
    if (method === 'default') {
      setImage(defaultImage);
      setImageSource('default');
      setImageError(false);
      
      // Pass null to the parent component
      onImageChange && onImageChange(null);
    }
  };
  
  // Handle image error
  const handleImageError = () => {
    setImageError('Failed to load image. Please check the URL or try another image.');
    setImage(defaultImage);
  };
  
  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      {/* Image preview */}
      <div 
        className={`relative w-36 h-36 rounded-full overflow-hidden mb-4 border-4 ${
          isDragging ? 'border-blue-400' : (imageSource === 'default' ? 'border-gray-200' : 'border-gray-300')
        } ${imageError ? 'border-red-400' : ''} cursor-pointer transition-all duration-200`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <img 
          src={image} 
          alt="Profile" 
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        
        {/* Hover overlay */}
        <div 
          className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200 ${
            isHovering || isDragging ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="text-white text-center">
            <i className="fas fa-camera text-2xl"></i>
            <p className="text-sm mt-1">{isDragging ? 'Drop image' : 'Change'}</p>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {imageError && (
        <div className="text-red-500 text-sm mb-3 text-center">
          {imageError}
        </div>
      )}
      
      {/* File input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg, image/png, image/gif, image/webp"
        onChange={handleFileChange}
      />
      
      {/* Image source options */}
      <div className="flex flex-col items-center space-y-3 w-full max-w-md">
        <div className="flex space-x-2 mb-2">
          <button
            type="button"
            onClick={() => handleMethodChange('file')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              imageSource === 'file' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fas fa-upload mr-1"></i> Upload
          </button>
          
          <button
            type="button"
            onClick={() => handleMethodChange('url')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              imageSource === 'url' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fas fa-link mr-1"></i> URL
          </button>
          
          <button
            type="button"
            onClick={() => handleMethodChange('default')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              imageSource === 'default' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fas fa-user-circle mr-1"></i> Default
          </button>
        </div>
        
        {/* URL input */}
        {imageSource === 'url' && (
          <div className="w-full">
            <input
              type="text"
              placeholder="Enter image URL..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={image !== defaultImage ? image : ''}
              onChange={handleUrlChange}
            />
            <p className="text-xs text-gray-500 mt-1">Enter the URL of an image (JPEG, PNG, GIF, WEBP)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
