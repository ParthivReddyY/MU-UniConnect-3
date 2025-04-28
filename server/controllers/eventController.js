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
    console.log('Booking request received:', {
      body: req.body,
      user: req.user ? { id: req.user.id, name: req.user.name } : 'No user in request',
      headers: {
        auth: req.headers.authorization ? 'Present' : 'Not present',
        contentType: req.headers['content-type']
      }
    });

    const { eventId, seats, contactDetails } = req.body;

    // Debug logging
    console.log('Parsed request data:', { eventId, seats: seats ? seats.length : 'None', contactDetails: !!contactDetails });
    
    // Get userId either from auth middleware or from contactDetails
    let userId;
    if (req.user && req.user.id) {
      userId = req.user.id;
      console.log('Using userId from authenticated user:', userId);
    } else if (req.user && req.user._id) {
      userId = req.user._id;
      console.log('Using _id from authenticated user:', userId);
    } else if (req.user && req.user.userId) {
      userId = req.user.userId;
      console.log('Using userId property from authenticated user:', userId);
    } else if (contactDetails && contactDetails.userId) {
      userId = contactDetails.userId;
      console.log('Using userId from contactDetails:', userId);
    } else {
      console.error('No user ID found in request or contact details');
      return res.status(400).json({
        success: false,
        message: 'User ID is required for booking'
      });
    }
    
    // Validate input
    if (!eventId) {
      console.error('Missing eventId in request');
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }
    
    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      console.error('Missing or invalid seats in request:', seats);
      return res.status(400).json({
        success: false,
        message: 'Please select at least one seat'
      });
    }
    
    if (!contactDetails) {
      console.error('Missing contactDetails in request');
      return res.status(400).json({
        success: false,
        message: 'Contact details are required'
      });
    }
    
    // Find the event
    console.log('Looking up event with ID:', eventId);
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      console.error('Event not found with ID:', eventId);
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    console.log('Found event:', event.title);
    
    // Check if event has passed
    if (new Date(event.date) < new Date()) {
      console.error('Event date has passed:', event.date);
      return res.status(400).json({
        success: false,
        message: 'Cannot book seats for past events'
      });
    }
    
    // Check if enough seats are available
    if (event.availableSeats < seats.length) {
      console.error('Not enough seats available:', { requested: seats.length, available: event.availableSeats });
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
      console.log('Checking seat availability for:', seats);
      
      for (const seatId of seats) {
        // Parse seat ID to find row and column (e.g., "A5" -> row: 0, col: 4)
        const rowIndex = seatId.charCodeAt(0) - 65; // 'A' is 65 in ASCII
        const colIndex = parseInt(seatId.substring(1)) - 1;
        
        console.log('Checking seat:', { seatId, rowIndex, colIndex });
        
        // Check if seat exists and is available
        if (!updatedSeatingMap[rowIndex]) {
          console.error('Invalid seat row:', { seatId, rowIndex });
          seatsAreAvailable = false;
          break;
        }
        
        if (!updatedSeatingMap[rowIndex][colIndex]) {
          console.error('Invalid seat column:', { seatId, rowIndex, colIndex });
          seatsAreAvailable = false;
          break;
        }
        
        if (updatedSeatingMap[rowIndex][colIndex].status !== 'available') {
          console.error('Seat not available:', { seatId, status: updatedSeatingMap[rowIndex][colIndex].status });
          seatsAreAvailable = false;
          break;
        }
        
        // Mark seat as booked
        updatedSeatingMap[rowIndex][colIndex].status = 'booked';
        console.log('Marked seat as booked:', seatId);
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
    console.log('Calculated total price:', totalPrice);
    
    // Ensure userId is a valid ObjectId
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
      console.log('Converted userId to ObjectId:', userObjectId);
    } catch (err) {
      console.error('Invalid user ID format:', { userId, error: err.message });
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Create booking record
    console.log('Creating booking with data:', {
      eventId,
      userId: userObjectId,
      seats: seats.length,
      totalPrice
    });
    
    const booking = new Booking({
      eventId,
      userId: userObjectId, // Ensure we're using a valid ObjectId
      seats,
      contactDetails,
      totalPrice,
      status: 'confirmed'
    });
    
    await booking.save({ session });
    console.log('Booking saved successfully:', booking._id);
    
    // Update event with new seating map (if exists) and available seats count
    console.log('Updating event available seats:', event.availableSeats - seats.length);
    const updateData = { 
      availableSeats: event.availableSeats - seats.length 
    };
    
    if (updatedSeatingMap) {
      updateData.seatingMap = updatedSeatingMap;
    }
    
    await Event.findByIdAndUpdate(
      eventId, 
      updateData,
      { session, runValidators: false }
    );
    console.log('Event updated successfully');
    
    await session.commitTransaction();
    console.log('Transaction committed successfully');
    
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
    console.log('Getting user bookings for user:', req.user ? {
      id: req.user.id,
      _id: req.user._id,
      userId: req.user.userId
    } : 'No user in request');

    // Try to get userId in different formats
    let userId;
    if (req.user && req.user.id) {
      userId = req.user.id;
      console.log('Using req.user.id:', userId);
    } else if (req.user && req.user._id) {
      userId = req.user._id;
      console.log('Using req.user._id:', userId);
    } else if (req.user && req.user.userId) {
      userId = req.user.userId;
      console.log('Using req.user.userId:', userId);
    } else {
      console.error('No userId found in request!');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or no user ID found'
      });
    }
    
    try {
      // Try to create ObjectId from userId to ensure proper format
      userId = new mongoose.Types.ObjectId(userId.toString());
      console.log('Converted userId to ObjectId:', userId);
    } catch (error) {
      console.error('Failed to convert userId to ObjectId:', error);
      // Continue with the string version if conversion fails
    }
    
    console.log('Searching for bookings with userId:', userId);
    
    // Get all bookings for this user and populate event details
    let bookings = [];
    
    // Try multiple ways to find the bookings
    const possibleUserIdFormats = [
      userId,                              // As is (might be ObjectId already)
      userId.toString(),                  // String version
      new mongoose.Types.ObjectId(userId.toString())  // Forced ObjectId
    ];
    
    console.log('Trying different user ID formats:', possibleUserIdFormats.map(id => id.toString()));
    
    // Try each format
    for (const idFormat of possibleUserIdFormats) {
      try {
        const results = await Booking.find({ userId: idFormat })
          .populate({
            path: 'eventId',
            select: 'title date time venue imageUrl'
          })
          .sort({ bookingDate: -1 }); // Most recent bookings first
          
        console.log(`Found ${results.length} bookings with ID format: ${idFormat}`);
        
        if (results.length > 0) {
          bookings = results;
          break; // Stop searching if we found bookings
        }
      } catch (error) {
        console.error(`Error searching with ID format ${idFormat}:`, error);
        // Continue trying other formats
      }
    }
    
    // If we still don't have bookings, do a more flexible search
    if (bookings.length === 0) {
      console.log('No bookings found with direct ID match, checking all bookings...');
      // Get all bookings and filter manually
      const allBookings = await Booking.find({})
        .populate({
          path: 'eventId',
          select: 'title date time venue imageUrl'
        })
        .sort({ bookingDate: -1 }); // Most recent bookings first
      
      console.log(`Found ${allBookings.length} total bookings in system`);
      
      // Examine each booking's userId
      for (const booking of allBookings) {
        console.log(`Booking ${booking._id} has userId: ${booking.userId}`);
      }
    }
    
    // Log the raw results
    console.log(`Found ${bookings.length} bookings for user ${userId}:`, 
      bookings.map(b => ({
        id: b._id,
        eventId: b.eventId?._id || b.eventId,
        eventTitle: b.eventId?.title || 'No title',
        seats: b.seats?.length || 0
      }))
    );
    
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
    // Using findByIdAndUpdate instead of save() to avoid validation issues
    const updateData = {
      seatingMap: updatedSeatingMap,
      availableSeats: event.availableSeats + booking.seats.length
    };
    
    await Event.findByIdAndUpdate(
      booking.eventId,
      updateData,
      { session, runValidators: false }
    );
    
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
    console.log('Create event request received:', {
      body: req.body,
      user: req.user ? { id: req.user.id, name: req.user.name, role: req.user.role } : 'No user in request',
      headers: {
        auth: req.headers.authorization ? 'Present' : 'Not present',
        contentType: req.headers['content-type']
      }
    });
    
    const { event } = req.body;
    
    if (!event) {
      console.error('No event object in request body');
      return res.status(400).json({
        success: false,
        message: 'Event data is missing'
      });
    }
    
    console.log('Event data received:', event);
    
    const hostId = req.user.id; // From auth middleware
    console.log('Host ID:', hostId);
    
    // Validate required fields
    if (!event.title || !event.date || !event.venue) {
      console.error('Missing required fields:', { 
        title: !!event.title, 
        date: !!event.date, 
        venue: !!event.venue 
      });
      return res.status(400).json({
        success: false,
        message: 'Please provide title, date, and venue'
      });
    }
    
    // Create the event
    const newEvent = new Event({
      ...event,
      hostId,
      totalSeats: event.totalSeats || 100, // Use provided value or default to 100
      availableSeats: event.availableSeats || event.totalSeats || 100
    });
    
    console.log('Creating new event:', {
      title: newEvent.title,
      date: newEvent.date,
      hostId: newEvent.hostId,
      totalSeats: newEvent.totalSeats,
      availableSeats: newEvent.availableSeats
    });
    
    await newEvent.save();
    console.log('Event created successfully with ID:', newEvent._id);
    
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