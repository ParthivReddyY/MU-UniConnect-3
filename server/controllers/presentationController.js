const Presentation = require('../models/Presentation');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Get all available presentation slots (for students)
const getAvailablePresentationSlots = async (req, res) => {
  try {
    // Find all active presentations (that haven't ended yet)
    const presentations = await Presentation.find({
      'presentationPeriod.end': { $gte: new Date() }
    })
    .populate('faculty', 'name department email')
    .lean();
    
    console.log(`Found ${presentations.length} active presentations`);
    
    // Format the presentations for frontend with enhanced date handling
    const formattedPresentations = presentations.map(presentation => {
      // Ensure slots array exists
      const slots = presentation.slots || [];
      
      // Only show available slots to students
      const availableSlots = slots.filter(slot => !slot.booked)
        .map(slot => ({
          ...slot,
          id: slot.id || (slot._id ? slot._id.toString() : null),
          _id: slot._id ? slot._id.toString() : (slot.id || null),
          time: slot.time ? new Date(slot.time).toISOString() : null
        }));
      
      const totalSlots = slots.length;
      
      console.log(`Presentation ${presentation._id}: ${availableSlots.length}/${totalSlots} slots available`);
      
      return {
        ...presentation,
        facultyName: presentation.faculty ? presentation.faculty.name : presentation.hostName,
        facultyDepartment: presentation.faculty ? presentation.faculty.department : presentation.hostDepartment,
        slots: availableSlots,
        availableSlots: availableSlots.length,
        totalSlots,
        // Ensure consistent presentation period format with ISO strings
        presentationPeriod: {
          start: presentation.presentationPeriod?.start ? new Date(presentation.presentationPeriod.start).toISOString() : null,
          end: presentation.presentationPeriod?.end ? new Date(presentation.presentationPeriod.end).toISOString() : null
        },
        // Ensure consistent registration period format with ISO strings
        registrationPeriod: {
          start: presentation.registrationPeriod?.start ? new Date(presentation.registrationPeriod.start).toISOString() : null,
          end: presentation.registrationPeriod?.end ? new Date(presentation.registrationPeriod.end).toISOString() : null
        }
      };
    });
    
    res.status(200).json(formattedPresentations);
  } catch (error) {
    console.error('Error getting available presentation slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to check if user is authorized to manage a presentation
const isAuthorizedForPresentation = (presentation, userId, userRole) => {
  // Authorization passes if:
  // 1. User is an admin, OR
  // 2. User is the faculty who created the presentation
  const presentationFacultyId = presentation.faculty.toString();
  const currentUserId = userId.toString();
  
  return userRole === 'admin' || presentationFacultyId === currentUserId;
};

// Get presentation slots created by a faculty member
const getFacultyPresentationSlots = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const presentations = await Presentation.find({ faculty: userId })
      .sort({ 'presentationPeriod.start': 1 })
      .lean();
    
    // Enhanced processing of presentations with proper date handling
    const processedPresentations = presentations.map(presentation => {
      // Ensure all dates are properly formatted as ISO strings
      const processedPresentation = {
        ...presentation,
        registrationPeriod: {
          start: presentation.registrationPeriod.start ? new Date(presentation.registrationPeriod.start).toISOString() : null,
          end: presentation.registrationPeriod.end ? new Date(presentation.registrationPeriod.end).toISOString() : null
        },
        presentationPeriod: {
          start: presentation.presentationPeriod.start ? new Date(presentation.presentationPeriod.start).toISOString() : null,
          end: presentation.presentationPeriod.end ? new Date(presentation.presentationPeriod.end).toISOString() : null
        }
      };

      // Process slots separately to keep the original data structure
      const slots = presentation.slots || [];
      
      // Calculate stats
      const totalSlots = slots.length;
      const bookedSlots = slots.filter(slot => 
        slot.status === 'booked' || 
        slot.status === 'in-progress' || 
        slot.status === 'completed'
      ).length;
      
      // Ensure each slot has the necessary data with proper date formatting
      const processedSlots = slots.map(slot => ({
        ...slot,
        id: slot.id || (slot._id ? slot._id.toString() : null),
        _id: slot._id ? slot._id.toString() : (slot.id || null),
        time: slot.time ? new Date(slot.time).toISOString() : null,
        bookedAt: slot.bookedAt ? new Date(slot.bookedAt).toISOString() : null,
        startedAt: slot.startedAt ? new Date(slot.startedAt).toISOString() : null,
        completedAt: slot.completedAt ? new Date(slot.completedAt).toISOString() : null
      }));
      
      return {
        ...processedPresentation,
        slots: processedSlots,
        slotStats: {
          totalCount: totalSlots,
          bookedCount: bookedSlots,
          availableCount: totalSlots - bookedSlots
        }
      };
    });
    
    res.status(200).json(processedPresentations);
  } catch (error) {
    console.error('Error getting faculty presentation slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new presentation slot
const createPresentationSlot = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      title, description, venue, participationType, teamSizeMin, teamSizeMax,
      registrationStart, registrationEnd, presentationStart, presentationEnd,
      slotConfig, targetAudience, gradingCriteria, customGradingCriteria,
      hostName, hostDepartment
    } = req.body;
    
    // Validate inputs
    if (!title || !venue || !slotConfig || !registrationStart || !registrationEnd || !presentationStart || !presentationEnd) {
      console.log('Missing required fields in presentation creation:', { title, venue, slotConfig });
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if user is faculty
    const user = await User.findById(userId);
    if (!user || (user.role !== 'faculty' && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Only faculty members can create presentation slots' });
    }
    
    // Format date strings consistently
    console.log('Original date inputs:', {
      registrationStart,
      registrationEnd,
      presentationStart,
      presentationEnd
    });
    
    // Parse all date strings to Date objects to ensure consistency
    const registrationStartDate = new Date(registrationStart);
    const registrationEndDate = new Date(registrationEnd);
    
    // Set presentation dates with the correct time component
    const presentationStartDate = new Date(presentationStart);
    const presentationEndDate = new Date(presentationEnd);
    // Ensure the end date is set to the end of the day
    presentationEndDate.setHours(23, 59, 59, 999);
    
    console.log('Parsed dates:', {
      registrationStartDate,
      registrationEndDate,
      presentationStartDate,
      presentationEndDate
    });
    
    // Generate time slots based on configuration
    const slots = generateTimeSlots(
      slotConfig.startTime,
      slotConfig.endTime,
      presentationStartDate,
      presentationEndDate,
      slotConfig.duration,
      slotConfig.buffer
    );
    
    // Create new presentation with all fields from client
    const presentationData = {
      title,
      description: description || '',
      venue,
      faculty: userId,
      facultyName: user.name,
      hostDepartment: hostDepartment || user.department || '',
      registrationPeriod: {
        start: registrationStartDate,
        end: registrationEndDate
      },
      presentationPeriod: {
        start: presentationStartDate,
        end: presentationEndDate
      },
      participationType: participationType || 'individual',
      teamSizeMin: teamSizeMin || 1,
      teamSizeMax: teamSizeMax || 1,
      slotConfig,
      slots
    };
    
    // Add optional fields if provided
    if (targetAudience) {
      presentationData.targetAudience = targetAudience;
    }
    
    if (customGradingCriteria && gradingCriteria) {
      presentationData.customGradingCriteria = true;
      presentationData.gradingCriteria = gradingCriteria;
    }
    
    const presentation = await Presentation.create(presentationData);
    
    res.status(201).json({
      success: true,
      message: 'Presentation event created successfully',
      presentation
    });
  } catch (error) {
    console.error('Error creating presentation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Book a presentation slot
const bookPresentationSlot = async (req, res) => {
  try {
    const presentationId = req.params.id;
    const userId = req.user.userId;
    const { 
      slotId, topic, teamName, teamMembers 
    } = req.body;
    
    console.log("Booking request received:", {
      presentationId,
      userId,
      slotId,
      topic,
      teamMembers: teamMembers?.length
    });
    
    if (!slotId) {
      return res.status(400).json({ message: 'Slot ID is required' });
    }
    
    // Find the presentation
    const presentation = await Presentation.findById(presentationId);
    
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found' });
    }
    
    // Find the specific slot
    const slotIndex = presentation.slots.findIndex(slot => 
      slot.id === slotId || slot._id.toString() === slotId
    );
    
    if (slotIndex === -1) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    
    // Check if slot is already booked
    if (presentation.slots[slotIndex].booked) {
      return res.status(409).json({ message: 'This slot is already booked' });
    }
    
    // Check if registration period is open
    const now = new Date();
    if (now < presentation.registrationPeriod.start || now > presentation.registrationPeriod.end) {
      return res.status(400).json({ message: 'Registration period is closed' });
    }
    
    // Get student information
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Update the slot
    presentation.slots[slotIndex].booked = true;
    presentation.slots[slotIndex].bookedBy = userId;
    presentation.slots[slotIndex].bookedAt = new Date();
    presentation.slots[slotIndex].status = 'booked';
    presentation.slots[slotIndex].topic = topic;
    
    // Handle team-based presentations
    if (presentation.participationType === 'team') {
      presentation.slots[slotIndex].teamName = teamName;
      
      // Process team members
      let processedTeamMembers = [];
      
      if (teamMembers && Array.isArray(teamMembers)) {
        processedTeamMembers = teamMembers.map(member => ({
          name: member.name,
          email: member.email,
          studentId: member.studentId || member.id
        }));
      }
      
      // Always include the booking student
      if (!processedTeamMembers.some(m => m.email === student.email)) {
        processedTeamMembers.push({
          name: student.name,
          email: student.email,
          studentId: student.studentId || student._id.toString()
        });
      }
      
      presentation.slots[slotIndex].teamMembers = processedTeamMembers;
    } else {
      // Individual presentation - just add the booking student
      presentation.slots[slotIndex].teamMembers = [{
        name: student.name,
        email: student.email,
        studentId: student.studentId || student._id.toString()
      }];
    }
    
    await presentation.save();
    
    res.status(200).json({
      success: true,
      message: 'Presentation slot booked successfully',
      slot: presentation.slots[slotIndex]
    });
  } catch (error) {
    console.error('Error booking presentation slot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Book a presentation slot with file attachment
const bookPresentationSlotWithFile = async (req, res) => {
  try {
    const presentationId = req.params.id;
    const userId = req.user.userId;
    
    // Check if we have the file and booking data
    if (!req.file && !req.body.data) {
      return res.status(400).json({ message: 'Missing file or booking data' });
    }

    // Parse the booking data from the form
    let bookingData;
    try {
      bookingData = JSON.parse(req.body.data);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid booking data format' });
    }
    
    const { 
      slotId, topic, teamName, teamMembers 
    } = bookingData;
    
    console.log("Booking request with file received:", {
      presentationId,
      userId,
      slotId,
      topic,
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      teamMembers: teamMembers?.length
    });
    
    if (!slotId) {
      return res.status(400).json({ message: 'Slot ID is required' });
    }
    
    // Find the presentation
    const presentation = await Presentation.findById(presentationId);
    
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found' });
    }
    
    // Find the specific slot
    const slotIndex = presentation.slots.findIndex(slot => 
      slot.id === slotId || slot._id.toString() === slotId
    );
    
    if (slotIndex === -1) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    
    // Check if slot is already booked
    if (presentation.slots[slotIndex].booked) {
      return res.status(409).json({ message: 'This slot is already booked' });
    }
    
    // Check if registration period is open
    const now = new Date();
    if (now < presentation.registrationPeriod.start || now > presentation.registrationPeriod.end) {
      return res.status(400).json({ message: 'Registration period is closed' });
    }
    
    // Get student information
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Handle file attachment
    let fileAttachment = null;
    if (req.file) {
      fileAttachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }
    
    // Update the slot
    presentation.slots[slotIndex].booked = true;
    presentation.slots[slotIndex].bookedBy = userId;
    presentation.slots[slotIndex].bookedAt = new Date();
    presentation.slots[slotIndex].status = 'booked';
    presentation.slots[slotIndex].topic = topic;
    
    // Add file attachment information
    if (fileAttachment) {
      presentation.slots[slotIndex].fileAttachment = fileAttachment;
    }
    
    // Handle team-based presentations
    if (presentation.participationType === 'team') {
      presentation.slots[slotIndex].teamName = teamName;
      
      // Process team members
      let processedTeamMembers = [];
      
      if (teamMembers && Array.isArray(teamMembers)) {
        processedTeamMembers = teamMembers.map(member => ({
          name: member.name,
          email: member.email,
          rollNumber: member.rollNumber || member.studentId || ''
        }));
      }
      
      // Always include the booking student
      if (!processedTeamMembers.some(m => m.email === student.email)) {
        processedTeamMembers.push({
          name: student.name,
          email: student.email,
          rollNumber: student.studentId || ''
        });
      }
      
      presentation.slots[slotIndex].teamMembers = processedTeamMembers;
    } else {
      // Individual presentation - just add the booking student
      presentation.slots[slotIndex].teamMembers = [{
        name: student.name,
        email: student.email,
        rollNumber: student.studentId || ''
      }];
    }
    
    await presentation.save();
    
    res.status(200).json({
      success: true,
      message: 'Presentation slot booked successfully with file attachment',
      slot: presentation.slots[slotIndex]
    });
  } catch (error) {
    console.error('Error booking presentation slot with file:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get slots for a specific presentation (for grading)
const getPresentationSlots = async (req, res) => {
  try {
    const presentationId = req.params.id;
    const userId = req.user.userId;
    
    console.log(`Getting slots for presentation: ${presentationId}`);
    console.log(`Request made by user: ${userId}, role: ${req.user.role}`);
    
    const presentation = await Presentation.findById(presentationId);
    
    if (!presentation) {
      console.error(`Presentation not found with ID: ${presentationId}`);
      return res.status(404).json({
        success: false,
        message: 'Presentation not found'
      });
    }
    
    console.log(`Presentation faculty ID: ${presentation.faculty}`);
    console.log(`Current user ID: ${userId}`);
    
    // Convert IDs to strings for proper comparison
    const presentationFaculty = presentation.faculty.toString();
    const currentUserId = userId.toString();
    
    // Check if user is the faculty who created this presentation or an admin
    if (presentationFaculty !== currentUserId && req.user.role !== 'admin') {
      console.error(`Access denied: User ${userId} (${req.user.role}) is not authorized to view slots for presentation ${presentationId}`);
      console.error(`Expected faculty ID: ${presentationFaculty}, actual user ID: ${currentUserId}`);
      
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these presentation slots'
      });
    }
    
    // Return the slots
    res.status(200).json(presentation.slots);
  } catch (error) {
    console.error('Error getting presentation slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Start a presentation (change slot status to in-progress)
const startPresentationSlot = async (req, res) => {
  try {
    const slotId = req.params.slotId;
    const userId = req.user.userId;
    
    // Find the presentation containing this slot (check both _id and id fields)
    const presentation = await Presentation.findOne({
      $or: [
        { 'slots._id': slotId },
        { 'slots.id': slotId }
      ]
    });
    
    if (!presentation) {
      return res.status(404).json({
        success: false, 
        message: 'Presentation or slot not found'
      });
    }
    
    // Check if user is authorized to manage this presentation
    if (!isAuthorizedForPresentation(presentation, userId, req.user.role)) {
      return res.status(403).json({
        success: false, 
        message: 'You are not authorized to manage this presentation'
      });
    }
    
    // Find the slot in the slots array (try both _id and id)
    let slotIndex = presentation.slots.findIndex(slot => slot._id.toString() === slotId);
    
    // If not found by _id, try with id field
    if (slotIndex === -1) {
      slotIndex = presentation.slots.findIndex(slot => slot.id === slotId);
    }
    
    if (slotIndex === -1) {
      console.error(`Slot with ID ${slotId} not found in presentation ${presentation._id}`);
      return res.status(404).json({
        success: false, 
        message: 'Slot not found in this presentation'
      });
    }
    
    // Update the slot status
    presentation.slots[slotIndex].status = 'in-progress';
    presentation.slots[slotIndex].startedAt = new Date();
    
    await presentation.save();
    console.log(`Slot ${slotId} status updated to in-progress`);
    
    res.status(200).json({
      success: true,
      message: 'Presentation started successfully',
      slot: presentation.slots[slotIndex]
    });
  } catch (error) {
    console.error('Error starting presentation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete a presentation (grade and provide feedback)
const completePresentationSlot = async (req, res) => {
  try {
    const slotId = req.params.slotId;
    const userId = req.user.userId;
    const { grades, feedback, totalScore, individualGrades } = req.body;
    
    // Find the presentation containing this slot
    const presentation = await Presentation.findOne({
      $or: [
        { 'slots._id': slotId },
        { 'slots.id': slotId }
      ]
    });
    
    if (!presentation) {
      return res.status(404).json({
        success: false, 
        message: 'Presentation or slot not found'
      });
    }
    
    // Check if user is authorized to manage this presentation
    if (!isAuthorizedForPresentation(presentation, userId, req.user.role)) {
      return res.status(403).json({
        success: false, 
        message: 'You are not authorized to manage this presentation'
      });
    }
    
    // Find the slot in the slots array
    let slotIndex = presentation.slots.findIndex(slot => slot._id.toString() === slotId);
    
    // If not found by _id, try with id field
    if (slotIndex === -1) {
      slotIndex = presentation.slots.findIndex(slot => slot.id === slotId);
    }
    
    if (slotIndex === -1) {
      return res.status(404).json({
        success: false, 
        message: 'Slot not found in this presentation'
      });
    }
    
    // Update the slot with grading info
    presentation.slots[slotIndex].status = 'completed';
    presentation.slots[slotIndex].grades = grades;
    presentation.slots[slotIndex].totalScore = totalScore;
    presentation.slots[slotIndex].feedback = feedback || '';
    
    // Add individual grades if provided
    if (individualGrades) {
      presentation.slots[slotIndex].individualGrades = individualGrades;
    }
    
    presentation.slots[slotIndex].completedAt = new Date();
    
    await presentation.save();
    
    res.status(200).json({
      success: true,
      message: 'Presentation graded successfully',
      slot: presentation.slots[slotIndex]
    });
  } catch (error) {
    console.error('Error completing presentation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete/cancel a presentation event
const deletePresentationSlot = async (req, res) => {
  try {
    const presentationId = req.params.id;
    const userId = req.user.userId;
    
    // Find the presentation
    const presentation = await Presentation.findById(presentationId);
    
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found' });
    }
    
    // Check if user is authorized to delete this presentation
    if (!isAuthorizedForPresentation(presentation, userId, req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to delete this presentation' });
    }
    
    // Delete the presentation
    await Presentation.findByIdAndDelete(presentationId);
    
    res.status(200).json({
      success: true,
      message: 'Presentation event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting presentation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single presentation by ID
const getPresentationById = async (req, res) => {
  try {
    const presentationId = req.params.id;

    // Use lean() to get a plain JS object that we can modify
    const presentation = await Presentation.findById(presentationId).lean();
    
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found' });
    }

    // Ensure consistent date format for client
    const formattedPresentation = {
      ...presentation,
      // Format the registration period dates as ISO strings
      registrationPeriod: {
        start: presentation.registrationPeriod?.start ? new Date(presentation.registrationPeriod.start).toISOString() : null,
        end: presentation.registrationPeriod?.end ? new Date(presentation.registrationPeriod.end).toISOString() : null
      },
      // Format the presentation period dates as ISO strings
      presentationPeriod: {
        start: presentation.presentationPeriod?.start ? new Date(presentation.presentationPeriod.start).toISOString() : null,
        end: presentation.presentationPeriod?.end ? new Date(presentation.presentationPeriod.end).toISOString() : null
      }
    };
    
    // Process slots to ensure proper format including IDs and dates
    if (Array.isArray(presentation.slots)) {
      formattedPresentation.slots = presentation.slots.map(slot => ({
        ...slot,
        id: slot.id || (slot._id ? slot._id.toString() : null),
        _id: slot._id ? slot._id.toString() : slot.id,
        time: slot.time ? new Date(slot.time).toISOString() : null,
        bookedAt: slot.bookedAt ? new Date(slot.bookedAt).toISOString() : null,
        startedAt: slot.startedAt ? new Date(slot.startedAt).toISOString() : null,
        completedAt: slot.completedAt ? new Date(slot.completedAt).toISOString() : null
      }));
    }

    res.status(200).json(formattedPresentation);
  } catch (error) {
    console.error('Error getting presentation by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add update presentation functionality
const updatePresentation = async (req, res) => {
  try {
    const presentationId = req.params.id;
    const userId = req.user.userId;
    
    // Find the presentation
    const presentation = await Presentation.findById(presentationId);
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found' });
    }
    
    // Check if user is authorized to update this presentation
    if (!isAuthorizedForPresentation(presentation, userId, req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to update this presentation' });
    }
    
    // Extract fields to update
    const {
      title, description, department, venue,
      registrationStart, registrationEnd, presentationStart, presentationEnd,
      slotConfig, participationType, teamSizeMin, teamSizeMax,
      targetAudience, gradingCriteria, customGradingCriteria
    } = req.body;
    
    // Update presentation fields
    if (title) presentation.title = title;
    if (description) presentation.description = description;
    if (department) presentation.department = department;
    if (venue) presentation.venue = venue;
    
    // Update registration and presentation periods
    if (registrationStart && registrationEnd) {
      presentation.registrationPeriod = {
        start: new Date(registrationStart),
        end: new Date(registrationEnd)
      };
    }
    
    if (presentationStart && presentationEnd) {
      presentation.presentationPeriod = {
        start: new Date(presentationStart),
        end: new Date(presentationEnd)
      };
    }
    
    // Update slot config
    if (slotConfig) presentation.slotConfig = slotConfig;
    
    // Update participation type and team sizes
    if (participationType) presentation.participationType = participationType;
    if (teamSizeMin !== undefined) presentation.teamSizeMin = teamSizeMin;
    if (teamSizeMax !== undefined) presentation.teamSizeMax = teamSizeMax;
    
    // Update target audience
    if (targetAudience) presentation.targetAudience = targetAudience;
    
    // Update grading criteria
    if (customGradingCriteria !== undefined) {
      presentation.customGradingCriteria = customGradingCriteria;
      
      if (gradingCriteria) {
        presentation.gradingCriteria = gradingCriteria;
      }
    }
    
    // Save the updated presentation
    await presentation.save();
    
    res.status(200).json({
      message: 'Presentation updated successfully',
      presentation
    });
    
  } catch (error) {
    console.error('Error updating presentation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, periodStart, periodEnd, duration, buffer) {
  const slots = [];
  const days = [];
  
  // Generate array of dates between start and end date
  let currentDate = new Date(periodStart);
  const endDate = new Date(periodEnd);
  
  // Ensure proper date handling
  currentDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log(`Generating slots for ${days.length} days from ${periodStart} to ${periodEnd}`);
  
  // Parse time strings
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // For each day, generate slots
  days.forEach(day => {
    let currentSlotTime = new Date(day);
    currentSlotTime.setHours(startHour, startMinute, 0);
    
    let endSlotTime = new Date(day);
    endSlotTime.setHours(endHour, endMinute, 0);
    
    // Duration in milliseconds
    const durationMs = duration * 60 * 1000;
    const bufferMs = buffer * 60 * 1000;
    const totalDurationMs = durationMs + bufferMs;
    
    while (currentSlotTime.getTime() + durationMs <= endSlotTime.getTime()) {
      // Use UUID instead of mongoose ObjectId
      const slotId = uuidv4();
      
      slots.push({
        id: slotId,
        time: new Date(currentSlotTime),
        booked: false,
        status: 'available'
      });
      
      // Move to next slot time (duration + buffer)
      currentSlotTime = new Date(currentSlotTime.getTime() + totalDurationMs);
    }
  });
  
  console.log(`Generated ${slots.length} total slots`);
  return slots;
}

module.exports = {
  getAvailablePresentationSlots,
  getFacultyPresentationSlots,
  createPresentationSlot,
  bookPresentationSlot,
  bookPresentationSlotWithFile,
  deletePresentationSlot,
  getPresentationSlots,
  startPresentationSlot,
  completePresentationSlot,
  getPresentationById,
  updatePresentation
};
