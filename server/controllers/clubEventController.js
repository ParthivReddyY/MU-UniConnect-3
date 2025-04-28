const { ClubEvent } = require('../models/ClubEvent');
const mongoose = require('mongoose');

// Get all club events
exports.getClubEvents = async (req, res) => {
  try {
    const events = await ClubEvent.find({ isPublished: true })
      .sort({ date: 1 }) // Sort by date ascending (upcoming events first)
      .populate('clubId', 'name logo')
      .select('-seatingMap'); // Don't send the seating map to reduce response size

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching club events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching club events',
      error: error.message
    });
  }
};

// Get club event details by ID
exports.getClubEventDetails = async (req, res) => {
  try {
    const event = await ClubEvent.findById(req.params.id)
      .populate('clubId', 'name description logo contactEmail');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Club event not found'
      });
    }

    // Don't show unpublished events to public
    if (!event.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Club event not found or not yet published'
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error fetching club event details:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching club event details',
      error: error.message
    });
  }
};

// Get events managed by the current club head/admin
exports.getManagedClubEvents = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    // First find clubs where user is head or admin
    let query = { clubId: { $in: req.user.managedClubs } };
    
    // If admin, they can see all club events
    if (req.user.role === 'admin') {
      query = {};
    }
    
    const events = await ClubEvent.find(query)
      .sort({ date: 1 })
      .populate('clubId', 'name logo');
    
    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
    
  } catch (error) {
    console.error('Error fetching managed club events:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching managed club events',
      error: error.message
    });
  }
};

// Create new club event
exports.createClubEvent = async (req, res) => {
  try {
    const { event } = req.body;
    const userId = req.user.id; // From auth middleware
    
    // Validate required fields
    if (!event.title || !event.date || !event.clubId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, date, and club ID'
      });
    }
    
    // Verify that user is authorized for this club
    if (req.user.role !== 'admin') {
      const isAuthorized = req.user.managedClubs && 
        req.user.managedClubs.some(clubId => clubId.toString() === event.clubId);
        
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to create events for this club'
        });
      }
    }
    
    // Create the event
    const newEvent = new ClubEvent({
      ...event,
      createdBy: userId,
      isPublished: event.isPublished || false
    });
    
    await newEvent.save();
    
    res.status(201).json({
      success: true,
      message: 'Club event created successfully',
      event: newEvent
    });
    
  } catch (error) {
    console.error('Error creating club event:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating club event',
      error: error.message
    });
  }
};

// Get details of a managed club event
exports.getManagedClubEventDetails = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id; // From auth middleware
    
    // Find event
    const event = await ClubEvent.findById(eventId)
      .populate('clubId', 'name description logo contactEmail');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Club event not found'
      });
    }
    
    // Check if the user is authorized for this club
    const isAuthorized = req.user.role === 'admin' || 
      (req.user.managedClubs && req.user.managedClubs.some(
        clubId => clubId.toString() === event.clubId._id.toString()
      ));
      
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this club event'
      });
    }
    
    // Get participation info if available
    // (This would be replaced with actual participation data from your system)
    const participants = [];
    
    res.status(200).json({
      success: true,
      event,
      participants
    });
    
  } catch (error) {
    console.error('Error fetching managed club event details:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching club event details',
      error: error.message
    });
  }
};

// Update a club event
exports.updateClubEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { event: updatedEventData } = req.body;
    
    // Find event
    const event = await ClubEvent.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Club event not found'
      });
    }
    
    // Check if the user is authorized for this club
    const isAuthorized = req.user.role === 'admin' || 
      (req.user.managedClubs && req.user.managedClubs.some(
        clubId => clubId.toString() === event.clubId.toString()
      ));
      
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this club event'
      });
    }
    
    // Update the event
    const result = await ClubEvent.findByIdAndUpdate(
      eventId,
      { ...updatedEventData },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Club event updated successfully',
      event: result
    });
    
  } catch (error) {
    console.error('Error updating club event:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating club event',
      error: error.message
    });
  }
};

// Delete a club event
exports.deleteClubEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Find event
    const event = await ClubEvent.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Club event not found'
      });
    }
    
    // Check if the user is authorized for this club
    const isAuthorized = req.user.role === 'admin' || 
      (req.user.managedClubs && req.user.managedClubs.some(
        clubId => clubId.toString() === event.clubId.toString()
      ));
      
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this club event'
      });
    }
    
    // Delete the event
    await ClubEvent.findByIdAndDelete(eventId);
    
    res.status(200).json({
      success: true,
      message: 'Club event deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting club event:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting club event',
      error: error.message
    });
  }
};