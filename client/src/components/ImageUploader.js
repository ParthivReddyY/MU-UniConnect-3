import React, { useState, useEffect, useRef } from 'react';

const ImageUploader = ({ initialImage, onImageChange, defaultImage = "/img/default-faculty.png" }) => {
  const [imagePreview, setImagePreview] = useState(initialImage || defaultImage);
  const [isUsingUrl, setIsUsingUrl] = useState(!initialImage || (initialImage && initialImage.startsWith('http')));
  const [imageUrl, setImageUrl] = useState(initialImage && initialImage.startsWith('http') ? initialImage : '');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasErrored, setHasErrored] = useState(false);
  const fileInputRef = useRef(null);

  // Update the preview if the initialImage prop changes
  useEffect(() => {
    if (initialImage) {
      setImagePreview(initialImage);
      setIsUsingUrl(initialImage.startsWith('http'));
      if (initialImage.startsWith('http')) {
        setImageUrl(initialImage);
      }
      setHasErrored(false); // Reset error state when initialImage changes
    }
  }, [initialImage]);

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      setErrorMessage('Image size should be less than 2MB');
      return;
    }

    setErrorMessage('');
    setHasErrored(false);

    // Create a preview URL for the selected file
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result;
      setImagePreview(previewUrl);
      onImageChange({ file, type: 'file', dataUrl: previewUrl });
    };
    reader.readAsDataURL(file);
  };

  // Handle URL input change
  const handleUrlChange = (event) => {
    const url = event.target.value.trim();
    setImageUrl(url);
    setErrorMessage('');

    if (url) {
      // Basic URL validation
      try {
        new URL(url);
        setImagePreview(url);
        setHasErrored(false);
        onImageChange({ url, type: 'url' });
      } catch (e) {
        setErrorMessage('Please enter a valid URL');
        setImagePreview(defaultImage);
        onImageChange({ url: '', type: 'url' });
      }
    } else {
      setImagePreview(defaultImage);
      setHasErrored(false);
      onImageChange({ url: '', type: 'url' });
    }
  };

  // Toggle between file upload and URL input
  const toggleInputType = () => {
    setIsUsingUrl(!isUsingUrl);
    if (isUsingUrl) {
      // Switching to file upload - clear the URL
      setImageUrl('');
      setImagePreview(defaultImage);
      setHasErrored(false);
      onImageChange({ type: 'reset' });
    } else {
      // Switching to URL input - clear the file
      if (fileInputRef.current) fileInputRef.current.value = '';
      setImagePreview(imageUrl || defaultImage);
      setHasErrored(false);
      onImageChange({ url: imageUrl, type: 'url' });
    }
  };

  // Provide a reliable fallback image for preview
  const inlineSVGFallback = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='40' r='20' fill='%23c0c0c0'/%3E%3Cpath d='M30,80 Q50,60 70,80' fill='%23c0c0c0'/%3E%3C/svg%3E`;

  const handleImageError = () => {
    if (!hasErrored) {
      setHasErrored(true);
      setImagePreview(inlineSVGFallback);
      setErrorMessage('Failed to load image. Please try another one.');
    }
  };

  return (
    <div className="image-uploader">
      {/* Image preview */}
      <div className="mb-4 flex justify-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
          <img
            src={imagePreview}
            alt="Profile preview"
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
      </div>

      {/* Toggle between file and URL input */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`py-2 px-4 text-sm font-medium rounded-l-lg ${
              !isUsingUrl
                ? 'bg-primary-red text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => isUsingUrl && toggleInputType()}
          >
            File Upload
          </button>
          <button
            type="button"
            className={`py-2 px-4 text-sm font-medium rounded-r-lg ${
              isUsingUrl
                ? 'bg-primary-red text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => !isUsingUrl && toggleInputType()}
          >
            Image URL
          </button>
        </div>
      </div>

      {/* Input fields */}
      <div>
        {isUsingUrl ? (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter a direct link to an image (must start with http:// or https://)
            </p>
          </div>
        ) : (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/gif, image/webp"
              className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-red file:text-white hover:file:bg-secondary-red"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum file size: 2MB. Supported formats: JPEG, PNG, GIF, WEBP
            </p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="text-red-500 text-sm mt-1">{errorMessage}</div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
