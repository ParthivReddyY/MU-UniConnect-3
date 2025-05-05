const Presentation = require('../models/Presentation');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Helper functions for streamlining common operations
const formatDateToISO = (dateInput) => {
  if (!dateInput) return null;
  return new Date(dateInput).toISOString();
};

const ensureISODates = (presentation) => {
  // Create shallow copy with formatted dates
  return {
    ...presentation,
    presentationPeriod: {
      start: presentation.presentationPeriod?.start ? formatDateToISO(presentation.presentationPeriod.start) : null,
      end: presentation.presentationPeriod?.end ? formatDateToISO(presentation.presentationPeriod.end) : null
    },
    registrationPeriod: {
      start: presentation.registrationPeriod?.start ? formatDateToISO(presentation.registrationPeriod.start) : null,
      end: presentation.registrationPeriod?.end ? formatDateToISO(presentation.registrationPeriod.end) : null
    }
  };
};

// Format slot with consistent ID and date fields
const formatSlot = (slot) => ({
  ...slot,
  id: slot.id || (slot._id ? slot._id.toString() : null),
  _id: slot._id ? slot._id.toString() : (slot.id || null),
  time: slot.time ? new Date(slot.time).toISOString() : null,
  bookedAt: slot.bookedAt ? new Date(slot.bookedAt).toISOString() : null,
  startedAt: slot.startedAt ? new Date(slot.startedAt).toISOString() : null,
  completedAt: slot.completedAt ? new Date(slot.completedAt).toISOString() : null
});

// Check if user is authorized to manage a presentation
const isAuthorizedForPresentation = (presentation, userId, userRole) => {
  // Authorization passes if:
  // 1. User is an admin, OR
  // 2. User is the faculty who created the presentation
  const presentationFacultyId = presentation.faculty.toString();
  const currentUserId = userId.toString();
  
  return userRole === 'admin' || presentationFacultyId === currentUserId;
};

// Validate and adjust team sizes
const validateTeamSizes = (participationType, teamSizeMin, teamSizeMax) => {
  if (participationType !== 'team') {
    return { validatedTeamSizeMin: 1, validatedTeamSizeMax: 1 };
  }
  
  // Ensure teamSizeMin is a valid number ≥ 1
  let validatedTeamSizeMin = parseInt(teamSizeMin, 10);
  if (isNaN(validatedTeamSizeMin) || validatedTeamSizeMin < 1) {
    validatedTeamSizeMin = 1;
  }
  
  // Ensure teamSizeMax is a valid number ≥ teamSizeMin
  let validatedTeamSizeMax = parseInt(teamSizeMax, 10);
  if (isNaN(validatedTeamSizeMax) || validatedTeamSizeMax < validatedTeamSizeMin) {
    validatedTeamSizeMax = validatedTeamSizeMin;
  }
  
  return { validatedTeamSizeMin, validatedTeamSizeMax };
};

// Normalize grading criteria to ensure weights add up to 100%
const normalizeGradingCriteria = (gradingCriteria) => {
  if (!Array.isArray(gradingCriteria) || gradingCriteria.length === 0) {
    return gradingCriteria;
  }
  
  const totalWeight = gradingCriteria.reduce(
    (sum, criterion) => sum + (parseInt(criterion.weight, 10) || 0), 0
  );
  
  if (totalWeight === 100) return gradingCriteria;
  
  console.log(`Adjusting grading criteria: total weight is ${totalWeight}%`);
  
  // Clone the criteria to avoid modifying the original
  const adjustedCriteria = [...gradingCriteria];
  
  // Adjust weights to total 100%
  const adjustmentFactor = 100 / Math.max(totalWeight, 1);
  adjustedCriteria.forEach((criterion, index) => {
    adjustedCriteria[index].weight = Math.round((parseInt(criterion.weight, 10) || 0) * adjustmentFactor);
  });
  
  // Fix any rounding errors
  const adjustedTotal = adjustedCriteria.reduce((sum, c) => sum + c.weight, 0);
  if (adjustedTotal !== 100 && adjustedCriteria.length > 0) {
    adjustedCriteria[0].weight += (100 - adjustedTotal);
  }
  
  return adjustedCriteria;
};

// Generate time slots based on configuration
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
      slots.push({
        id: uuidv4(),
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
    
    // Format and return presentations with consistent date handling
    const formattedPresentations = presentations.map(presentation => {
      // Ensure slots array exists
      const slots = presentation.slots || [];
      
      // Only show available slots to students
      const availableSlots = slots.filter(slot => !slot.booked).map(formatSlot);
      
      return {
        ...presentation,
        facultyName: presentation.faculty ? presentation.faculty.name : presentation.hostName,
        facultyDepartment: presentation.faculty ? presentation.faculty.department : presentation.hostDepartment,
        slots: availableSlots,
        availableSlots: availableSlots.length,
        totalSlots: slots.length,
        ...ensureISODates(presentation)
      };
    });
    
    res.status(200).json(formattedPresentations);
  } catch (error) {
    console.error('Error getting available presentation slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get presentation slots created by a faculty member
const getFacultyPresentationSlots = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const presentations = await Presentation.find({ faculty: userId })
      .sort({ 'presentationPeriod.start': 1 })
      .lean();
    
    // Process presentations with consistent date handling
    const processedPresentations = presentations.map(presentation => {
      // Ensure all dates are properly formatted
      const processedPresentation = ensureISODates(presentation);
      
      // Process slots
      const slots = presentation.slots || [];
      
      // Calculate stats
      const totalSlots = slots.length;
      const bookedSlots = slots.filter(slot => 
        slot.status === 'booked' || 
        slot.status === 'in-progress' || 
        slot.status === 'completed'
      ).length;
      
      return {
        ...processedPresentation,
        slots: slots.map(formatSlot),
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
    
    // Validate required inputs
    if (!title || !venue || !slotConfig || !registrationStart || !registrationEnd || !presentationStart || !presentationEnd) {
      console.log('Missing required fields in presentation creation');
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if user is faculty or admin
    const user = await User.findById(userId);
    if (!user || (user.role !== 'faculty' && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Only faculty members can create presentation slots' });
    }
    
    // Process target audience data
    const processedTargetAudience = {
      year: Array.isArray(targetAudience?.year) 
        ? targetAudience.year.map(y => Number(y)).filter(y => !isNaN(y))
        : [],
      school: Array.isArray(targetAudience?.school) ? targetAudience.school : [],
      department: Array.isArray(targetAudience?.department) ? targetAudience.department : []
    };

    console.log('Processed target audience:', processedTargetAudience);
    
    // Parse date strings to Date objects
    const registrationStartDate = new Date(registrationStart);
    const registrationEndDate = new Date(registrationEnd);
    const presentationStartDate = new Date(presentationStart);
    const presentationEndDate = new Date(presentationEnd);
    
    // Ensure the end date includes the full day
    presentationEndDate.setHours(23, 59, 59, 999);
    
    // Validate team sizes
    const { validatedTeamSizeMin, validatedTeamSizeMax } = 
      validateTeamSizes(participationType, teamSizeMin, teamSizeMax);
    
    // Generate slots based on configuration
    const slots = generateTimeSlots(
      slotConfig.startTime,
      slotConfig.endTime,
      presentationStartDate,
      presentationEndDate,
      slotConfig.duration,
      slotConfig.buffer
    );
    
    // Create presentation data object
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
      teamSizeMin: validatedTeamSizeMin,
      teamSizeMax: validatedTeamSizeMax,
      slotConfig,
      slots,
      targetAudience: processedTargetAudience
    };
    
    // Add optional target audience if provided
    if (targetAudience) {
      presentationData.targetAudience = targetAudience;
    }
    
    // Add normalized grading criteria if provided
    if (customGradingCriteria && gradingCriteria) {
      presentationData.customGradingCriteria = true;
      presentationData.gradingCriteria = normalizeGradingCriteria(gradingCriteria);
    }
    
    // Create the presentation in the database
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

// Update an existing presentation
const updatePresentation = async (req, res) => {
  try {
    const presentationId = req.params.id;
    const userId = req.user.userId;
    
    // Find the presentation
    const presentation = await Presentation.findById(presentationId);
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found' });
    }
    
    // Check authorization
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
    
    // Update basic fields if provided
    if (title) presentation.title = title;
    if (description !== undefined) presentation.description = description;
    if (department) presentation.department = department;
    if (venue) presentation.venue = venue;
    
    // Update dates if provided
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
    
    // Update participation type
    if (participationType) presentation.participationType = participationType;
    
    // Update team sizes with validation
    if (teamSizeMin !== undefined || teamSizeMax !== undefined) {
      const { validatedTeamSizeMin, validatedTeamSizeMax } = validateTeamSizes(
        participationType || presentation.participationType,
        teamSizeMin !== undefined ? teamSizeMin : presentation.teamSizeMin,
        teamSizeMax !== undefined ? teamSizeMax : presentation.teamSizeMax
      );
      
      presentation.teamSizeMin = validatedTeamSizeMin;
      presentation.teamSizeMax = validatedTeamSizeMax;
    }
    
    // Update target audience with proper type conversion
    if (targetAudience) {
      presentation.targetAudience = {
        year: Array.isArray(targetAudience.year) 
          ? targetAudience.year.map(y => Number(y)).filter(y => !isNaN(y))
          : presentation.targetAudience.year || [],
        school: Array.isArray(targetAudience.school)
          ? targetAudience.school
          : presentation.targetAudience.school || [],
        department: Array.isArray(targetAudience.department)
          ? targetAudience.department
          : presentation.targetAudience.department || []
      };
    }
    
    // Update grading criteria
    if (customGradingCriteria !== undefined) {
      presentation.customGradingCriteria = customGradingCriteria;
      
      if (gradingCriteria && Array.isArray(gradingCriteria)) {
        // Normalize the grading criteria weights
        presentation.gradingCriteria = normalizeGradingCriteria(gradingCriteria);
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

// Get a single presentation by ID
const getPresentationById = async (req, res) => {
  try {
    const presentationId = req.params.id;

    // Use lean() to get a plain JS object
    const presentation = await Presentation.findById(presentationId).lean();
    
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found' });
    }

    // Format presentation for consistent response
    const formattedPresentation = {
      ...presentation,
      ...ensureISODates(presentation)
    };
    
    // Process slots for consistent format
    if (Array.isArray(presentation.slots)) {
      formattedPresentation.slots = presentation.slots.map(formatSlot);
    }

    res.status(200).json(formattedPresentation);
  } catch (error) {
    console.error('Error getting presentation by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Book a presentation slot
const bookPresentationSlot = async (req, res) => {
  try {
    const presentationId = req.params.id;
    const userId = req.user.userId;
    const { 
      slotId, topic, teamName, teamMembers, description 
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
    
    // Check if this user already has a booking in this presentation
    const userHasBooking = presentation.slots.some(slot => 
      slot.booked && 
      ((slot.bookedBy && slot.bookedBy.toString() === userId) || 
       (slot.teamMembers && slot.teamMembers.some(m => m.email === req.user.email)))
    );
    
    if (userHasBooking) {
      return res.status(400).json({ message: 'You already have a booking for this presentation' });
    }
    
    // Check if any team member already has a booking
    if (teamMembers && teamMembers.length > 0) {
      const teamEmails = teamMembers.map(member => member.email);
      
      const existingMemberBookings = presentation.slots.filter(slot => 
        slot.booked && slot.teamMembers && 
        slot.teamMembers.some(m => teamEmails.includes(m.email))
      );
      
      if (existingMemberBookings.length > 0) {
        const bookedMembers = [];
        existingMemberBookings.forEach(slot => {
          slot.teamMembers.forEach(member => {
            if (teamEmails.includes(member.email) && !bookedMembers.includes(member.email)) {
              bookedMembers.push(member.email);
            }
          });
        });
        
        return res.status(400).json({ 
          message: 'One or more team members already have a booking for this presentation',
          bookedMembers
        });
      }
    }
    
    // Update the slot
    presentation.slots[slotIndex].booked = true;
    presentation.slots[slotIndex].bookedBy = userId;
    presentation.slots[slotIndex].bookedAt = new Date();
    presentation.slots[slotIndex].status = 'booked';
    presentation.slots[slotIndex].topic = topic;
    presentation.slots[slotIndex].description = description || '';
    
    // Handle team-based presentations
    if (presentation.participationType === 'team') {
      presentation.slots[slotIndex].teamName = teamName;
      
      // Process team members
      let processedTeamMembers = [];
      
      if (teamMembers && Array.isArray(teamMembers)) {
        processedTeamMembers = teamMembers.map(member => ({
          name: member.name,
          email: member.email,
          rollNumber: member.rollNumber || '',  // Use rollNumber directly
          studentId: member.id || member.studentId  // Store studentId separately
        }));
      }
      
      // Always include the booking student
      if (!processedTeamMembers.some(m => m.email === student.email)) {
        processedTeamMembers.push({
          name: student.name,
          email: student.email,
          rollNumber: student.studentId || '',  // Use studentId as rollNumber for student
          studentId: student._id.toString()
        });
      }
      
      presentation.slots[slotIndex].teamMembers = processedTeamMembers;
    } else {
      // Individual presentation - just add the booking student
      presentation.slots[slotIndex].teamMembers = [{
        name: student.name,
        email: student.email,
        rollNumber: student.studentId || '',  // Use studentId as rollNumber
        studentId: student._id.toString()
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
    
    // Check if this user already has a booking in this presentation
    const userHasBooking = presentation.slots.some(slot => 
      slot.booked && 
      ((slot.bookedBy && slot.bookedBy.toString() === userId) || 
       (slot.teamMembers && slot.teamMembers.some(m => m.email === req.user.email)))
    );
    
    if (userHasBooking) {
      return res.status(400).json({ message: 'You already have a booking for this presentation' });
    }
    
    // Check if any team member already has a booking
    if (teamMembers && teamMembers.length > 0) {
      const teamEmails = teamMembers.map(member => member.email);
      
      const existingMemberBookings = presentation.slots.filter(slot => 
        slot.booked && slot.teamMembers && 
        slot.teamMembers.some(m => teamEmails.includes(m.email))
      );
      
      if (existingMemberBookings.length > 0) {
        const bookedMembers = [];
        existingMemberBookings.forEach(slot => {
          slot.teamMembers.forEach(member => {
            if (teamEmails.includes(member.email) && !bookedMembers.includes(member.email)) {
              bookedMembers.push(member.email);
            }
          });
        });
        
        return res.status(400).json({ 
          message: 'One or more team members already have a booking for this presentation',
          bookedMembers
        });
      }
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
          rollNumber: member.rollNumber || '',  // Use rollNumber directly
          studentId: member.id || member.studentId  // Store studentId separately
        }));
      }
      
      // Always include the booking student
      if (!processedTeamMembers.some(m => m.email === student.email)) {
        processedTeamMembers.push({
          name: student.name,
          email: student.email,
          rollNumber: student.studentId || '',  // Use studentId as rollNumber for student
          studentId: student._id.toString()
        });
      }
      
      presentation.slots[slotIndex].teamMembers = processedTeamMembers;
    } else {
      // Individual presentation - just add the booking student
      presentation.slots[slotIndex].teamMembers = [{
        name: student.name,
        email: student.email,
        rollNumber: student.studentId || '',  // Use studentId as rollNumber
        studentId: student._id.toString()
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

// Get a single slot by ID
const getSlotById = async (req, res) => {
  try {
    const slotId = req.params.slotId;
    
    // Find the presentation that contains this slot
    const presentation = await Presentation.findOne({
      $or: [
        { 'slots._id': slotId },
        { 'slots.id': slotId }
      ]
    });
    
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation slot not found' });
    }
    
    // Find the specific slot in the presentation
    const slot = presentation.slots.find(s => 
      (s._id && s._id.toString() === slotId) || (s.id === slotId)
    );
    
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    
    // If this is a secured slot, check if the user is authorized
    if (slot.booked && slot.bookedBy) {
      // Convert both IDs to strings for comparison
      const slotBooker = slot.bookedBy.toString();
      const currentUser = req.user.userId.toString();
      
      // Check if the user is the faculty who created the presentation or is an admin
      const isAuthorized = isAuthorizedForPresentation(presentation, req.user.userId, req.user.role);
      
      // Allow access if:
      // 1. User is authorized (faculty or admin), OR
      // 2. User is the student who booked the slot
      if (!isAuthorized && slotBooker !== currentUser) {
        return res.status(403).json({ message: 'You do not have permission to view this presentation slot' });
      }
    }
    
    res.status(200).json(slot);
  } catch (error) {
    console.error('Error fetching slot by ID:', error);
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
    
    // Validate input
    if (!grades || typeof totalScore !== 'number') {
      return res.status(400).json({ message: 'Missing required fields for grading' });
    }

    // Find the presentation containing this slot
    const presentation = await Presentation.findOne({
      $or: [
        { 'slots._id': slotId },
        { 'slots.id': slotId }
      ]
    });
    
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation slot not found' });
    }
    
    // Check if user is authorized to manage this presentation
    if (!isAuthorizedForPresentation(presentation, userId, req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to grade this presentation' });
    }

    // Find the slot in the slots array
    let slotIndex = presentation.slots.findIndex(slot => slot._id.toString() === slotId);
    
    // If not found by _id, try with id field
    if (slotIndex === -1) {
      slotIndex = presentation.slots.findIndex(slot => slot.id === slotId);
    }
    
    if (slotIndex === -1) {
      return res.status(404).json({ message: 'Slot not found in presentation' });
    }
    
    // Check if the slot is booked
    if (!presentation.slots[slotIndex].booked) {
      return res.status(400).json({ message: 'Cannot grade an unbooked slot' });
    }
    
    // Update the slot with grades and feedback
    presentation.slots[slotIndex].grades = grades;
    presentation.slots[slotIndex].individualGrades = individualGrades || {};
    presentation.slots[slotIndex].feedback = feedback || '';
    presentation.slots[slotIndex].totalScore = totalScore;
    presentation.slots[slotIndex].status = 'completed';
    presentation.slots[slotIndex].completedAt = new Date();
    
    await presentation.save();
    
    res.status(200).json({
      success: true,
      message: 'Presentation graded successfully',
      slot: presentation.slots[slotIndex]
    });
  } catch (error) {
    console.error('Error grading presentation:', error);
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

// New function to check if a team has existing bookings
const checkTeamBookings = async (req, res) => {
  try {
    const { emails, presentationId } = req.body;
    
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ message: 'Invalid email list' });
    }
    
    // Find all presentations with slots booked by any of the provided emails
    const presentations = await Presentation.find({
      'slots.teamMembers.email': { $in: emails }
    });
    
    // Get the list of emails that already have bookings
    const bookedMembers = [];
    
    presentations.forEach(presentation => {
      presentation.slots.forEach(slot => {
        if (slot.booked && slot.teamMembers) {
          slot.teamMembers.forEach(member => {
            if (emails.includes(member.email) && !bookedMembers.includes(member.email)) {
              bookedMembers.push(member.email);
            }
          });
        }
      });
    });
    
    return res.status(200).json({
      hasBookings: bookedMembers.length > 0,
      bookedMembers
    });
  } catch (error) {
    console.error('Error checking team bookings:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get bookings for the current user
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find all presentations with slots booked by this user
    const presentations = await Presentation.find({
      'slots.bookedBy': userId
    }).populate('faculty', 'name department email');
    
    const bookings = [];
    
    presentations.forEach(presentation => {
      presentation.slots.forEach(slot => {
        if (slot.bookedBy && slot.bookedBy.toString() === userId) {
          bookings.push({
            presentationId: presentation._id,
            presentationTitle: presentation.title,
            faculty: presentation.faculty,
            venue: presentation.venue,
            slot: {
              ...slot.toObject(),
              id: slot._id.toString(),
              time: slot.time
            }
          });
        }
      });
    });
    
    // Also find presentations where the user is a team member but not the booker
    const teamPresentations = await Presentation.find({
      'slots.teamMembers.email': req.user.email
    }).populate('faculty', 'name department email');
    
    teamPresentations.forEach(presentation => {
      presentation.slots.forEach(slot => {
        // Check if user is in team members but not the booker
        if (slot.teamMembers && slot.teamMembers.some(m => m.email === req.user.email) && 
            (!slot.bookedBy || slot.bookedBy.toString() !== userId)) {
          bookings.push({
            presentationId: presentation._id,
            presentationTitle: presentation.title,
            faculty: presentation.faculty,
            venue: presentation.venue,
            isTeamMember: true,
            slot: {
              ...slot.toObject(),
              id: slot._id.toString(),
              time: slot.time
            }
          });
        }
      });
    });
    
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error getting my bookings:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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
  updatePresentation,
  getSlotById,
  checkTeamBookings,
  getMyBookings
};
