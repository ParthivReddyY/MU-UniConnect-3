const CalendarEvent = require('../models/CalendarEvent');
const { isValidObjectId } = require('mongoose');

/**
 * Create a new calendar event
 */
exports.createCalendarEvent = async (req, res) => {
  try {
    // Set the userId to the current user's ID
    const eventData = {
      ...req.body,
      userId: req.user.id
    };

    // Ensure required fields are present
    if (!eventData.title || !eventData.date || !eventData.datetime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, date, and datetime are required fields'
      });
    }

    // Create the new event
    const newEvent = new CalendarEvent(eventData);
    await newEvent.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating calendar event',
      error: error.message
    });
  }
};

/**
 * Get all calendar events for the current user
 */
exports.getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all events for the current user
    const events = await CalendarEvent.find({ userId });
    
    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Error fetching user calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user calendar events',
      error: error.message
    });
  }
};

/**
 * Get public calendar events
 */
exports.getPublicEvents = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { year, month, category } = req.query;
    
    // Build the filter object
    const filter = { visibility: 'public' };
    
    // Add date filtering if provided
    if (year) {
      // For year filtering, we need to check the date string
      // which is in ISO format (YYYY-MM-DD)
      const yearStr = year.toString();
      filter.date = { $regex: `^${yearStr}-` };
      
      // Add month filtering if provided
      if (month) {
        const monthStr = month.toString().padStart(2, '0');
        filter.date = { $regex: `^${yearStr}-${monthStr}-` };
      }
    }
    
    // Add category filtering if provided
    if (category) {
      filter.category = category;
    }
    
    // Find public events with the specified filters
    const events = await CalendarEvent.find(filter);
    
    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Error fetching public calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching public calendar events',
      error: error.message
    });
  }
};

/**
 * Update a calendar event
 */
exports.updateCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }
    
    // Find the event
    const event = await CalendarEvent.findById(id);
    
    // Check if event exists
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }
    
    // Check if user is the owner of the event
    if (event.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }
    
    // Update the event
    const updatedEvent = await CalendarEvent.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating calendar event',
      error: error.message
    });
  }
};

/**
 * Delete a calendar event
 */
exports.deleteCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }
    
    // Find the event
    const event = await CalendarEvent.findById(id);
    
    // Check if event exists
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }
    
    // Check if user is the owner of the event
    if (event.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }
    
    // Delete the event
    await CalendarEvent.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting calendar event',
      error: error.message
    });
  }
};