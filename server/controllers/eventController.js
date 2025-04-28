const { Event, Booking } = require('../models/EventBooking');
const mongoose = require('mongoose');

// Get all university events
exports.getUniversityEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .sort({ date: 1 }) // Sort by date ascending (upcoming events first)
      .select('-seatingMap'); // Don't send the seating map to reduce response size

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events',
      error: error.message
    });
  }
};

// Get event details by ID
exports.getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error fetching event details:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event details',
      error: error.message
    });
  }
};

// Book an event
exports.bookEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId, seats, contactDetails } = req.body;
    
    // Get userId either from auth middleware or from contactDetails
    let userId;
    if (req.user && req.user.id) {
      userId = req.user.id;
    } else if (contactDetails && contactDetails.userId) {
      userId = contactDetails.userId;
    } else {
      return res.status(400).json({
        success: false,
        message: 'User ID is required for booking'
      });
    }
    
    // Validate input
    if (!eventId || !seats || seats.length === 0 || !contactDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event ID, seats, and contact details'
      });
    }
    
    // Find the event
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if event has passed
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book seats for past events'
      });
    }
    
    // Check if enough seats are available
    if (event.availableSeats < seats.length) {
      return res.status(400).json({
        success: false,
        message: 'Not enough seats available'
      });
    }

    // Initialize or use existing seating map
    let updatedSeatingMap = event.seatingMap;
    let seatsAreAvailable = true;
    
    // If there's a seating map, check seat availability in it
    if (updatedSeatingMap) {
      // Create a deep copy of the seating map
      updatedSeatingMap = JSON.parse(JSON.stringify(updatedSeatingMap));
      
      for (const seatId of seats) {
        // Parse seat ID to find row and column (e.g., "A5" -> row: 0, col: 4)
        const rowIndex = seatId.charCodeAt(0) - 65; // 'A' is 65 in ASCII
        const colIndex = parseInt(seatId.substring(1)) - 1;
        
        // Check if seat exists and is available
        if (!updatedSeatingMap[rowIndex] || 
            !updatedSeatingMap[rowIndex][colIndex] ||
            updatedSeatingMap[rowIndex][colIndex].status !== 'available') {
          seatsAreAvailable = false;
          break;
        }
        
        // Mark seat as booked
        updatedSeatingMap[rowIndex][colIndex].status = 'booked';
      }
      
      if (!seatsAreAvailable) {
        return res.status(400).json({
          success: false,
          message: 'One or more selected seats are not available'
        });
      }
    }
    
    // Calculate total price
    const totalPrice = event.ticketPrice * seats.length;
    
    // Create booking record
    const booking = new Booking({
      eventId,
      userId,
      seats,
      contactDetails,
      totalPrice,
      status: 'confirmed'
    });
    
    await booking.save({ session });
    
    // Update event with new seating map (if exists) and available seats count
    if (updatedSeatingMap) {
      event.seatingMap = updatedSeatingMap;
    }
    event.availableSeats -= seats.length;
    await event.save({ session });
    
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      message: 'Booking confirmed',
      booking
    });
    
  } catch (error) {
    await session.abortTransaction();
    console.error('Error booking event:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while booking event',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    // Get all bookings for this user and populate event details
    const bookings = await Booking.find({ userId })
      .populate({
        path: 'eventId',
        select: 'title date time venue imageUrl'
      })
      .sort({ bookingDate: -1 }); // Most recent bookings first
    
    // Transform data for frontend
    const transformedBookings = bookings.map(booking => ({
      _id: booking._id,
      event: booking.eventId,
      seats: booking.seats,
      totalPrice: booking.totalPrice,
      bookingDate: booking.bookingDate,
      status: booking.status
    }));
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: transformedBookings
    });
    
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: error.message
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const bookingId = req.params.id;
    const userId = req.user.id; // From auth middleware
    
    // Find booking
    const booking = await Booking.findById(bookingId).session(session);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if booking belongs to this user
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled'
      });
    }
    
    // Find the event
    const event = await Event.findById(booking.eventId).session(session);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if event has passed
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel bookings for past events'
      });
    }
    
    // Update seating map - mark seats as available again
    const updatedSeatingMap = JSON.parse(JSON.stringify(event.seatingMap));
    
    for (const seatId of booking.seats) {
      // Parse seat ID to find row and column
      const rowIndex = seatId.charCodeAt(0) - 65; // 'A' is 65 in ASCII
      const colIndex = parseInt(seatId.substring(1)) - 1;
      
      if (updatedSeatingMap[rowIndex] && updatedSeatingMap[rowIndex][colIndex]) {
        updatedSeatingMap[rowIndex][colIndex].status = 'available';
      }
    }
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save({ session });
    
    // Update event with new seating map and available seats count
    event.seatingMap = updatedSeatingMap;
    event.availableSeats += booking.seats.length;
    await event.save({ session });
    
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });
    
  } catch (error) {
    await session.abortTransaction();
    console.error('Error cancelling booking:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// ========= FACULTY/ADMIN ROUTES =========

// Get events hosted by the current user
exports.getHostedEvents = async (req, res) => {
  try {
    const hostId = req.user.id; // From auth middleware
    
    const events = await Event.find({ hostId })
      .sort({ date: 1 }) // Upcoming events first
      .select('-seatingMap'); // Don't send the seating map to reduce response size
    
    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
    
  } catch (error) {
    console.error('Error fetching hosted events:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hosted events',
      error: error.message
    });
  }
};

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const { event } = req.body;
    const hostId = req.user.id; // From auth middleware
    
    // Validate required fields
    if (!event.title || !event.date || !event.venue) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, date, and venue'
      });
    }
    
    // Create the event
    const newEvent = new Event({
      ...event,
      hostId,
      totalSeats: event.availableSeats || 100, // Default to 100 seats if not specified
      availableSeats: event.availableSeats || 100
    });
    
    await newEvent.save();
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: newEvent
    });
    
  } catch (error) {
    console.error('Error creating event:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating event',
      error: error.message
    });
  }
};

// Get details of a hosted event
exports.getHostedEventDetails = async (req, res) => {
  try {
    const eventId = req.params.id;
    const hostId = req.user.id; // From auth middleware
    
    // Find event
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if the event is hosted by this user
    if (event.hostId.toString() !== hostId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this event'
      });
    }
    
    // Get bookings for this event
    const bookings = await Booking.find({ eventId })
      .populate({
        path: 'userId',
        select: 'name email'
      });
    
    res.status(200).json({
      success: true,
      event,
      bookings
    });
    
  } catch (error) {
    console.error('Error fetching hosted event details:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event details',
      error: error.message
    });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { event: updatedEventData } = req.body;
    const hostId = req.user.id; // From auth middleware
    
    // Find event
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if the event is hosted by this user
    if (event.hostId.toString() !== hostId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }
    
    // Check if the event has already started
    if (new Date(event.date) < new Date() && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update an event that has already started'
      });
    }
    
    // Don't allow changing the number of seats if there are bookings
    if (updatedEventData.totalSeats !== event.totalSeats || 
        updatedEventData.availableSeats !== event.availableSeats) {
      
      const bookingsCount = await Booking.countDocuments({ 
        eventId, 
        status: 'confirmed' 
      });
      
      if (bookingsCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change seat capacity for an event with existing bookings'
        });
      }
    }
    
    // Update the event
    const result = await Event.findByIdAndUpdate(
      eventId,
      { ...updatedEventData },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: result
    });
    
  } catch (error) {
    console.error('Error updating event:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating event',
      error: error.message
    });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const eventId = req.params.id;
    const hostId = req.user.id; // From auth middleware
    
    // Find event
    const event = await Event.findById(eventId).session(session);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if the event is hosted by this user
    if (event.hostId.toString() !== hostId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }
    
    // Check for existing bookings
    const bookings = await Booking.find({ 
      eventId, 
      status: 'confirmed' 
    }).session(session);
    
    if (bookings.length > 0 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an event with existing bookings'
      });
    }
    
    // If admin is deleting or no bookings exist, proceed with deletion
    // First, set all related bookings to cancelled
    await Booking.updateMany(
      { eventId },
      { status: 'cancelled' },
      { session }
    );
    
    // Then delete the event
    await Event.findByIdAndDelete(eventId).session(session);
    
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
    
  } catch (error) {
    await session.abortTransaction();
    console.error('Error deleting event:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting event',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};