import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../../contexts/AuthContext';
import RichTextEditor from '../../../../../components/RichTextEditor';
import '../../../../../CSS/forms.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const EditEvent = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { eventId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState(null);
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

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`/api/events/${eventId}`);
        const event = response.data.event;
        
        if (event) {
          // Format the date for the input field (YYYY-MM-DD)
          const formattedDate = new Date(event.date).toISOString().split('T')[0];
          
          setEventData({
            title: event.title || '',
            caption: event.caption || '',
            description: event.description || '',
            date: formattedDate,
            time: event.time || '19:00',
            venue: event.venue || '',
            ticketPrice: event.ticketPrice || 0,
            totalSeats: event.totalSeats || 100,
            categories: event.categories || ['Academic'],
            imageUrl: event.imageUrl
          });
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        toast.error('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData({
      ...eventData,
      [name]: value
    });
  };

  const handleDescriptionChange = (content) => {
    setEventData({
      ...eventData,
      description: content
    });
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
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('You must be logged in to update an event');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Upload new image if provided
      let imageUrl = eventData.imageUrl || '';
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

      // Update event with the image URL
      const eventPayload = {
        ...eventData,
        imageUrl
      };

      const response = await axios.put(`/api/events/${eventId}`, eventPayload);
      
      if (response.data.success) {
        toast.success('Event updated successfully!');
        navigate('/college/bookings/manage-events');
      } else {
        toast.error('Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
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

  if (isLoading) {
    return (
      <div className="form-container">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-red mx-auto"></div>
          <p className="mt-3">Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h1 className="form-title">Edit Event</h1>
      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-group">
          <label htmlFor="title">Event Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={eventData.title}
            onChange={handleInputChange}
            required
            className="form-control"
            placeholder="Enter event title"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="caption">Caption/Tagline</label>
          <input
            type="text"
            id="caption"
            name="caption"
            value={eventData.caption}
            onChange={handleInputChange}
            className="form-control"
            placeholder="Short tagline for your event"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Event Description*</label>
          <RichTextEditor
            value={eventData.description}
            onChange={handleDescriptionChange}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="date">Event Date*</label>
            <input
              type="date"
              id="date"
              name="date"
              value={eventData.date}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group half">
            <label htmlFor="time">Event Time*</label>
            <input
              type="time"
              id="time"
              name="time"
              value={eventData.time}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="venue">Venue*</label>
          <input
            type="text"
            id="venue"
            name="venue"
            value={eventData.venue}
            onChange={handleInputChange}
            required
            className="form-control"
            placeholder="Event location"
          />
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="ticketPrice">Ticket Price (₹)</label>
            <input
              type="number"
              id="ticketPrice"
              name="ticketPrice"
              value={eventData.ticketPrice}
              onChange={handleInputChange}
              className="form-control"
              min="0"
              step="10"
              placeholder="0 for free events"
            />
          </div>
          
          <div className="form-group half">
            <label htmlFor="totalSeats">Total Seats*</label>
            <input
              type="number"
              id="totalSeats"
              name="totalSeats"
              value={eventData.totalSeats}
              onChange={handleInputChange}
              required
              className="form-control"
              min="1"
              placeholder="Number of available seats"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Event Category*</label>
          <select
            id="category"
            name="category"
            value={eventData.categories[0]}
            onChange={handleCategoryChange}
            required
            className="form-control"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Event Poster/Image</label>
          {eventData.imageUrl && (
            <div className="mb-3">
              <img 
                src={eventData.imageUrl} 
                alt="Current event poster" 
                className="w-full max-h-48 object-cover rounded-md mb-2"
              />
              <p className="text-sm text-gray-500">Current image</p>
            </div>
          )}
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            className="form-control"
          />
          <small>Recommended size: 1200 x 630 pixels. Leave empty to keep current image.</small>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/college/bookings/manage-events')} 
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;