const PresentationSlot = require('../models/PresentationSlot');

// Create a new presentation slot
exports.createPresentationSlot = async (req, res) => {
  try {
    const {
      title,
      description,
      venue,
      date,
      startTime,
      endTime,
      duration,
      bufferTime,
      presentationType,
      minTeamMembers,
      maxTeamMembers,
      targetYear,
      targetSchool,
      targetDepartment
    } = req.body;

    // Create a new presentation slot
    const newSlot = new PresentationSlot({
      title,
      description,
      venue,
      date,
      startTime,
      endTime,
      duration,
      bufferTime: bufferTime || 0,
      presentationType,
      minTeamMembers: presentationType === 'team' ? minTeamMembers : undefined,
      maxTeamMembers: presentationType === 'team' ? maxTeamMembers : undefined,
      targetYear,
      targetSchool,
      targetDepartment,
      host: {
        user: req.user.userId || req.user._id, // Fix: Use either userId or _id from the authenticated user
        name: req.user.name,
        email: req.user.email
      }
    });

    const savedSlot = await newSlot.save();
    res.status(201).json(savedSlot);
  } catch (err) {
    console.error('Error creating presentation slot:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create multiple presentation slots (batch creation)
exports.createBatchPresentationSlots = async (req, res) => {
  try {
    const { 
      commonData, 
      dates, 
      timeSlots 
    } = req.body;

    if (!dates || !dates.length || !timeSlots || !timeSlots.length) {
      return res.status(400).json({ message: 'Dates and time slots are required' });
    }

    const slotsToCreate = [];
    
    // Generate a slot for each date and time combination
    dates.forEach(date => {
      timeSlots.forEach(timeSlot => {
        slotsToCreate.push({
          ...commonData,
          date,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          host: {
            user: req.user.userId || req.user._id, // Fix: Use either userId or _id from the authenticated user
            name: req.user.name,
            email: req.user.email
          }
        });
      });
    });

    const createdSlots = await PresentationSlot.insertMany(slotsToCreate);
    res.status(201).json(createdSlots);
  } catch (err) {
    console.error('Error creating batch presentation slots:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all presentation slots created by a host
exports.getHostPresentationSlots = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id; // Fix: Use either userId or _id
    const slots = await PresentationSlot.find({ 'host.user': userId })
      .sort({ date: 1, startTime: 1 });
    res.json(slots);
  } catch (err) {
    console.error('Error fetching host presentation slots:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get available presentation slots for students based on filters
exports.getAvailablePresentationSlots = async (req, res) => {
  try {
    const { year, school, department, date, status } = req.query;
    
    const filter = { status: status || 'available' };
    
    // Add optional filters
    if (year) filter.targetYear = year;
    if (school) filter.targetSchool = school;
    if (department) filter.targetDepartment = department;
    if (date) filter.date = new Date(date);
    
    const slots = await PresentationSlot.find(filter)
      .sort({ date: 1, startTime: 1 });
    
    res.json(slots);
  } catch (err) {
    console.error('Error fetching available presentation slots:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single presentation slot by ID
exports.getPresentationSlotById = async (req, res) => {
  try {
    const slot = await PresentationSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ message: 'Presentation slot not found' });
    }
    
    res.json(slot);
  } catch (err) {
    console.error('Error fetching presentation slot:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a presentation slot
exports.updatePresentationSlot = async (req, res) => {
  try {
    const slot = await PresentationSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ message: 'Presentation slot not found' });
    }
    
    // Check if the user is the host of the presentation slot
    const userId = req.user.userId || req.user._id; // Fix: Use either userId or _id
    if (slot.host.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this presentation slot' });
    }
    
    // Check if the slot is already booked
    if (slot.status === 'booked') {
      return res.status(400).json({ message: 'Cannot update a booked presentation slot' });
    }
    
    // Update fields
    const updatedFields = req.body;
    
    // Mark as updated
    updatedFields.updatedAt = Date.now();
    
    const updatedSlot = await PresentationSlot.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );
    
    res.json(updatedSlot);
  } catch (err) {
    console.error('Error updating presentation slot:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a presentation slot
exports.deletePresentationSlot = async (req, res) => {
  try {
    const slot = await PresentationSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ message: 'Presentation slot not found' });
    }
    
    // Check if the user is the host of the presentation slot
    const userId = req.user.userId || req.user._id; // Fix: Use either userId or _id
    if (slot.host.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this presentation slot' });
    }
    
    // Check if the slot is already booked
    if (slot.status === 'booked') {
      return res.status(400).json({ message: 'Cannot delete a booked presentation slot' });
    }
    
    await slot.remove();
    
    res.json({ message: 'Presentation slot deleted successfully' });
  } catch (err) {
    console.error('Error deleting presentation slot:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Book a presentation slot
exports.bookPresentationSlot = async (req, res) => {
  try {
    const slot = await PresentationSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ message: 'Presentation slot not found' });
    }
    
    // Check if the slot is already booked
    if (slot.status !== 'available') {
      return res.status(400).json({ message: 'This presentation slot is not available for booking' });
    }
    
    // Extract booking information
    const { teamMembers } = req.body;
    
    // Validate team members if it's a team presentation
    if (slot.presentationType === 'team') {
      if (!teamMembers || !Array.isArray(teamMembers)) {
        return res.status(400).json({ message: 'Team members are required for team presentations' });
      }
      
      if (teamMembers.length < slot.minTeamMembers || teamMembers.length > slot.maxTeamMembers) {
        return res.status(400).json({ 
          message: `Team size must be between ${slot.minTeamMembers} and ${slot.maxTeamMembers} members` 
        });
      }
    }
    
    // Update the slot status and booking info
    const userId = req.user.userId || req.user._id; // Fix: Use either userId or _id
    slot.status = 'booked';
    slot.bookedBy = {
      user: userId,
      name: req.user.name,
      email: req.user.email,
      rollNumber: req.user.studentId,
      teamMembers: slot.presentationType === 'team' ? teamMembers : []
    };
    slot.updatedAt = Date.now();
    
    const updatedSlot = await slot.save();
    
    res.json(updatedSlot);
  } catch (err) {
    console.error('Error booking presentation slot:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Cancel a booked presentation slot
exports.cancelBooking = async (req, res) => {
  try {
    const slot = await PresentationSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ message: 'Presentation slot not found' });
    }
    
    // Check if the slot is booked
    if (slot.status !== 'booked') {
      return res.status(400).json({ message: 'This presentation slot is not booked' });
    }
    
    // Check if the user is the one who booked the slot
    const userId = req.user.userId || req.user._id; // Fix: Use either userId or _id
    if (!slot.bookedBy || slot.bookedBy.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    // Reset the slot to available
    slot.status = 'available';
    slot.bookedBy = undefined;
    slot.updatedAt = Date.now();
    
    const updatedSlot = await slot.save();
    
    res.json(updatedSlot);
  } catch (err) {
    console.error('Error canceling presentation slot booking:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get booked slots for a student
exports.getStudentBookings = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id; // Fix: Use either userId or _id
    const slots = await PresentationSlot.find({ 
      status: 'booked',
      'bookedBy.user': userId
    }).sort({ date: 1, startTime: 1 });
    
    res.json(slots);
  } catch (err) {
    console.error('Error fetching student bookings:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};