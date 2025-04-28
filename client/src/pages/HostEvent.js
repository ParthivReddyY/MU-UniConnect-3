import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import '../CSS/forms.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const HostEvent = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');
  
  const [eventData, setEventData] = useState({
    title: '',
    caption: '',
    description: '',
    date: '',
    time: '19:00',
    venue: '',
    ticketPrice: 0,
    totalSeats: 100,
    categories: ['Academic']
  });

  const [image, setImage] = useState(null);
  
  // Validation states
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData({
      ...eventData,
      [name]: value
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleDescriptionChange = (content) => {
    setEventData({
      ...eventData,
      description: content
    });
    
    if (content && formErrors.description) {
      setFormErrors({
        ...formErrors,
        description: ''
      });
    }
  };

  const handleCategoryChange = (e) => {
    const { value } = e.target;
    setEventData({
      ...eventData,
      categories: [value] // For now, supporting single category selection
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(selectedImage);
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, eventData[field]);
  };

  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'title':
        if (!value) error = 'Event title is required';
        else if (value.length < 5) error = 'Title must be at least 5 characters long';
        break;
      case 'date':
        if (!value) error = 'Event date is required';
        else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            error = 'Event date cannot be in the past';
          }
        }
        break;
      case 'venue':
        if (!value) error = 'Venue is required';
        break;
      case 'totalSeats':
        if (!value) error = 'Total seats are required';
        else if (value <= 0) error = 'Total seats must be greater than 0';
        break;
      default:
        break;
    }
    
    setFormErrors({
      ...formErrors,
      [field]: error
    });
    
    return !error;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    if (!eventData.title || eventData.title.length < 5) {
      newErrors.title = 'Event title must be at least 5 characters long';
      isValid = false;
    }
    
    if (!eventData.description) {
      newErrors.description = 'Event description is required';
      isValid = false;
    }
    
    if (!eventData.date) {
      newErrors.date = 'Event date is required';
      isValid = false;
    } else {
      const selectedDate = new Date(eventData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Event date cannot be in the past';
        isValid = false;
      }
    }
    
    if (!eventData.time) {
      newErrors.time = 'Event time is required';
      isValid = false;
    }
    
    if (!eventData.venue) {
      newErrors.venue = 'Venue is required';
      isValid = false;
    }
    
    if (!eventData.totalSeats || eventData.totalSeats <= 0) {
      newErrors.totalSeats = 'Total seats must be greater than 0';
      isValid = false;
    }
    
    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('You must be logged in to host an event');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Upload image if provided
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        
        const uploadResponse = await axios.post('/api/upload/event-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        imageUrl = uploadResponse.data.imageUrl;
      }

      // Create event with the image URL
      const eventPayload = {
        ...eventData,
        imageUrl,
        hostId: currentUser._id
      };

      const response = await axios.post('/api/events/create', eventPayload);
      
      if (response.data.success) {
        toast.success('Event created successfully!');
        // Update the navigation path to the college events management page
        navigate('/college/bookings/manage-events');
      } else {
        toast.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    'Academic',
    'Cultural',
    'Sports',
    'Workshop',
    'Seminar',
    'Conference',
    'Other'
  ];

  // Navigation between form sections
  const sections = ['basic', 'details', 'logistics', 'media'];
  
  const getNextSection = () => {
    const currentIndex = sections.indexOf(activeSection);
    return sections[currentIndex + 1] || activeSection;
  };

  const getPrevSection = () => {
    const currentIndex = sections.indexOf(activeSection);
    return sections[currentIndex - 1] || activeSection;
  };

  const moveToNextSection = () => {
    const nextSection = getNextSection();
    setActiveSection(nextSection);
    
    // Scroll to top of form section
    document.querySelector('.form-container').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const moveToPrevSection = () => {
    setActiveSection(getPrevSection());
    
    // Scroll to top of form section
    document.querySelector('.form-container').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="form-container max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-primary-red to-secondary-red text-white p-6">
        <h1 className="text-2xl md:text-3xl font-bold">Host a New Event</h1>
        <p className="mt-2 opacity-90">Create an engaging event for your community</p>
      </div>
      
      {/* Progress indicator */}
      <div className="bg-gray-50 px-6 py-3 border-b">
        <div className="flex justify-between items-center relative">
          {sections.map((section, index) => (
            <div 
              key={section} 
              className="flex flex-col items-center z-10"
              onClick={() => setActiveSection(section)}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold
                ${activeSection === section ? 'bg-primary-red text-white' : 
                  sections.indexOf(activeSection) > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                cursor-pointer transition-all duration-200
              `}>
                {index + 1}
              </div>
              <span className={`
                text-xs mt-1 hidden sm:block
                ${activeSection === section ? 'text-primary-red font-medium' : 
                  sections.indexOf(activeSection) > index ? 'text-green-500' : 'text-gray-500'}
              `}>
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </span>
            </div>
          ))}
          
          <div className="absolute left-0 right-0 h-0.5 bg-gray-200" style={{ top: '16px', zIndex: 0 }}>
            <div className="h-full bg-primary-red transition-all duration-300" 
              style={{ width: `${(sections.indexOf(activeSection) / (sections.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        {/* Basic Information */}
        <div className={`transition-opacity duration-300 ${activeSection === 'basic' ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <div className="w-8 h-8 bg-primary-red/10 rounded-full flex items-center justify-center mr-2">
              <i className="fas fa-info-circle text-primary-red"></i>
            </div>
            Basic Information
          </h2>
          
          <div className="mb-5">
            <label htmlFor="title" className="block mb-2 font-medium text-gray-700">
              Event Title*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <i className="fas fa-heading"></i>
              </div>
              <input
                type="text"
                id="title"
                name="title"
                value={eventData.title}
                onChange={handleInputChange}
                onBlur={() => handleBlur('title')}
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200 
                  ${formErrors.title && touched.title ? 'border-red-500 focus:ring-red-200' : 
                    'border-gray-300 focus:border-primary-red focus:ring-primary-red/20'}`}
                placeholder="Enter a catchy event title"
              />
            </div>
            {formErrors.title && touched.title && (
              <p className="mt-1 text-red-500 text-sm">{formErrors.title}</p>
            )}
          </div>
          
          <div className="mb-5">
            <label htmlFor="caption" className="block mb-2 font-medium text-gray-700">
              Caption/Tagline <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <i className="fas fa-quote-left"></i>
              </div>
              <input
                type="text"
                id="caption"
                name="caption"
                value={eventData.caption}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary-red focus:ring-2 focus:ring-primary-red/20 transition-all duration-200"
                placeholder="Short tagline to capture attention"
              />
            </div>
          </div>
          
          <div className="mb-5">
            <label htmlFor="description" className="block mb-2 font-medium text-gray-700">
              Event Description*
            </label>
            <RichTextEditor
              value={eventData.description}
              onChange={handleDescriptionChange}
            />
            {formErrors.description && (
              <p className="mt-1 text-red-500 text-sm">{formErrors.description}</p>
            )}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={moveToNextSection}
              className="px-6 py-2.5 bg-primary-red hover:bg-secondary-red text-white rounded-lg transition-colors flex items-center"
            >
              Next Step <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
        
        {/* Date & Time */}
        <div className={`transition-opacity duration-300 ${activeSection === 'details' ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <div className="w-8 h-8 bg-primary-red/10 rounded-full flex items-center justify-center mr-2">
              <i className="fas fa-calendar text-primary-red"></i>
            </div>
            Date & Time
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="date" className="block mb-2 font-medium text-gray-700">
                Event Date*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <i className="fas fa-calendar-day"></i>
                </div>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('date')}
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200
                    ${formErrors.date && touched.date ? 'border-red-500 focus:ring-red-200' : 
                      'border-gray-300 focus:border-primary-red focus:ring-primary-red/20'}`}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {formErrors.date && touched.date && (
                <p className="mt-1 text-red-500 text-sm">{formErrors.date}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="time" className="block mb-2 font-medium text-gray-700">
                Event Time*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <i className="fas fa-clock"></i>
                </div>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={eventData.time}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('time')}
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200
                    ${formErrors.time && touched.time ? 'border-red-500 focus:ring-red-200' : 
                      'border-gray-300 focus:border-primary-red focus:ring-primary-red/20'}`}
                />
              </div>
              {formErrors.time && touched.time && (
                <p className="mt-1 text-red-500 text-sm">{formErrors.time}</p>
              )}
            </div>
          </div>
          
          <div className="mt-5">
            <label htmlFor="venue" className="block mb-2 font-medium text-gray-700">
              Venue*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <input
                type="text"
                id="venue"
                name="venue"
                value={eventData.venue}
                onChange={handleInputChange}
                onBlur={() => handleBlur('venue')}
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200
                  ${formErrors.venue && touched.venue ? 'border-red-500 focus:ring-red-200' : 
                    'border-gray-300 focus:border-primary-red focus:ring-primary-red/20'}`}
                placeholder="Event location (e.g. Auditorium, Conference Hall)"
              />
            </div>
            {formErrors.venue && touched.venue && (
              <p className="mt-1 text-red-500 text-sm">{formErrors.venue}</p>
            )}
          </div>
          
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={moveToPrevSection}
              className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back
            </button>
            
            <button
              type="button"
              onClick={moveToNextSection}
              className="px-6 py-2.5 bg-primary-red hover:bg-secondary-red text-white rounded-lg transition-colors flex items-center"
            >
              Next Step <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
        
        {/* Event Logistics */}
        <div className={`transition-opacity duration-300 ${activeSection === 'logistics' ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <div className="w-8 h-8 bg-primary-red/10 rounded-full flex items-center justify-center mr-2">
              <i className="fas fa-cog text-primary-red"></i>
            </div>
            Event Logistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label htmlFor="ticketPrice" className="block mb-2 font-medium text-gray-700">
                Ticket Price (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <i className="fas fa-rupee-sign"></i>
                </div>
                <input
                  type="number"
                  id="ticketPrice"
                  name="ticketPrice"
                  value={eventData.ticketPrice}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary-red focus:ring-2 focus:ring-primary-red/20 transition-all duration-200"
                  min="0"
                  step="10"
                  placeholder="0 for free events"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">Leave at 0 for free events</p>
            </div>
            
            <div>
              <label htmlFor="totalSeats" className="block mb-2 font-medium text-gray-700">
                Total Seats*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <i className="fas fa-chair"></i>
                </div>
                <input
                  type="number"
                  id="totalSeats"
                  name="totalSeats"
                  value={eventData.totalSeats}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('totalSeats')}
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200
                    ${formErrors.totalSeats && touched.totalSeats ? 'border-red-500 focus:ring-red-200' : 
                      'border-gray-300 focus:border-primary-red focus:ring-primary-red/20'}`}
                  min="1"
                  placeholder="Number of available seats"
                />
              </div>
              {formErrors.totalSeats && touched.totalSeats && (
                <p className="mt-1 text-red-500 text-sm">{formErrors.totalSeats}</p>
              )}
            </div>
          </div>
          
          <div className="mb-5">
            <label htmlFor="category" className="block mb-2 font-medium text-gray-700">
              Event Category*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <i className="fas fa-tag"></i>
              </div>
              <select
                id="category"
                name="category"
                value={eventData.categories[0]}
                onChange={handleCategoryChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary-red focus:ring-2 focus:ring-primary-red/20 transition-all duration-200 bg-white"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={moveToPrevSection}
              className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back
            </button>
            
            <button
              type="button"
              onClick={moveToNextSection}
              className="px-6 py-2.5 bg-primary-red hover:bg-secondary-red text-white rounded-lg transition-colors flex items-center"
            >
              Next Step <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
        
        {/* Media & Preview */}
        <div className={`transition-opacity duration-300 ${activeSection === 'media' ? 'block opacity-100' : 'hidden opacity-0'}`}>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <div className="w-8 h-8 bg-primary-red/10 rounded-full flex items-center justify-center mr-2">
              <i className="fas fa-image text-primary-red"></i>
            </div>
            Event Media
          </h2>
          
          <div className="mb-6">
            <label htmlFor="image" className="block mb-2 font-medium text-gray-700">
              Event Poster/Image <span className="text-gray-500 font-normal">(recommended)</span>
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-red transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Event preview" 
                    className="max-h-60 mx-auto rounded-md shadow-md"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ) : (
                <div className="py-4">
                  <label htmlFor="image" className="cursor-pointer">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                      <i className="fas fa-cloud-upload-alt text-gray-500 text-2xl"></i>
                    </div>
                    <p className="text-gray-700 mb-1 font-medium">Click to upload an image</p>
                    <p className="text-gray-500 text-sm">Recommended size: 1200 x 630 pixels</p>
                    <p className="text-gray-500 text-sm">Support formats: JPG, PNG, WEBP</p>
                  </label>
                </div>
              )}
              
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Event Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium">{eventData.title || 'Not specified'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium">
                  {eventData.date ? new Date(eventData.date).toLocaleDateString() : 'Not specified'} 
                  {eventData.time ? ` at ${eventData.time}` : ''}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Venue</p>
                <p className="font-medium">{eventData.venue || 'Not specified'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{eventData.categories[0]}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Ticket Price</p>
                <p className="font-medium">
                  {eventData.ticketPrice > 0 ? `₹${eventData.ticketPrice}` : 'Free'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Total Seats</p>
                <p className="font-medium">{eventData.totalSeats}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={moveToPrevSection}
              className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back
            </button>
            
            <div className="space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className={`px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center
                  ${isSubmitting ? 'opacity-75 pointer-events-none' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Event <i className="fas fa-check ml-2"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HostEvent;