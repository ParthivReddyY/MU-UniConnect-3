const Presentation = require('../models/Presentation');
const User = require('../models/User');
const { sendEmail, TEMPLATES } = require('../utils/sendEmail');

// Get all available presentation slots (for students)
const getAvailablePresentationSlots = async (req, res) => {
  try {
    const presentations = await Presentation.find({ 
      booked: false,
      date: { $gte: new Date() } // Only future slots
    })
    .populate('faculty', 'name department')
    .sort({ date: 1, startTime: 1 })
    .lean();
    
    // Map presentations to include faculty name
    const formattedPresentations = presentations.map(presentation => ({
      ...presentation,
      facultyName: presentation.faculty.name,
      facultyDepartment: presentation.faculty.department
    }));
    
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
      .populate('bookedBy', 'name email studentId')
      .sort({ date: 1, startTime: 1 })
      .lean();
    
    res.status(200).json(presentations);
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
      title, description, date, startTime, endTime, 
      location, presentationType, maxParticipants 
    } = req.body;
    
    // Validate inputs
    if (!title || !date || !startTime || !endTime || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if user is faculty
    const user = await User.findById(userId);
    if (!user || (user.role !== 'faculty' && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Only faculty members can create presentation slots' });
    }
    
    // Create new presentation slot
    const presentation = await Presentation.create({
      title,
      description: description || '',
      date,
      startTime,
      endTime,
      location,
      presentationType: presentationType || 'Academic',
      maxParticipants: maxParticipants || 1,
      faculty: userId,
      facultyName: user.name,
      booked: false
    });
    
    res.status(201).json({
      success: true,
      message: 'Presentation slot created successfully',
      presentation
    });
  } catch (error) {
    console.error('Error creating presentation slot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Book a presentation slot
const bookPresentationSlot = async (req, res) => {
  try {
    const presentationId = req.params.id;
    const userId = req.user.userId;
    
    // Find the presentation slot
    const presentation = await Presentation.findById(presentationId);
    
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation slot not found' });
    }
    
    // Check if slot is already booked
    if (presentation.booked) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }
    
    // Book the slot
    presentation.booked = true;
    presentation.bookedBy = userId;
    presentation.bookedAt = new Date();
    await presentation.save();
    
    // Get user and faculty information for email
    const student = await User.findById(userId);
    const faculty = await User.findById(presentation.faculty);
    
    // Send email notifications
    try {
      // Notify faculty
      await sendEmail({
        email: faculty.email,
        templateId: TEMPLATES.PRESENTATION_BOOKING_FACULTY,
        params: {
          facultyName: faculty.name,
          studentName: student.name,
          studentEmail: student.email,
          title: presentation.title,
          date: new Date(presentation.date).toLocaleDateString(),
          startTime: new Date(presentation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: presentation.location
        }
      });
      
      // Notify student
      await sendEmail({
        email: student.email,
        templateId: TEMPLATES.PRESENTATION_BOOKING_STUDENT,
        params: {
          studentName: student.name,
          facultyName: faculty.name,
          title: presentation.title,
          date: new Date(presentation.date).toLocaleDateString(),
          startTime: new Date(presentation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: presentation.location
        }
      });
    } catch (emailError) {
      console.error('Error sending presentation booking emails:', emailError);
      // Continue with the booking process even if email fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Presentation slot booked successfully',
      presentation
    });
  } catch (error) {
    console.error('Error booking presentation slot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete/cancel a presentation slot
const deletePresentationSlot = async (req, res) => {
  try {
    const presentationId = req.params.id;
    const userId = req.user.userId;
    
    // Find the presentation slot
    const presentation = await Presentation.findById(presentationId);
    
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation slot not found' });
    }
    
    // Ensure only the faculty who created it can delete it
    if (presentation.faculty.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this presentation slot' });
    }
    
    // If booked, notify the student
    if (presentation.booked && presentation.bookedBy) {
      try {
        const student = await User.findById(presentation.bookedBy);
        const faculty = await User.findById(presentation.faculty);
        
        if (student && faculty) {
          await sendEmail({
            email: student.email,
            templateId: TEMPLATES.PRESENTATION_CANCELLATION,
            params: {
              studentName: student.name,
              facultyName: faculty.name,
              title: presentation.title,
              date: new Date(presentation.date).toLocaleDateString(),
              startTime: new Date(presentation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              reason: 'The faculty member has cancelled this presentation slot.'
            }
          });
        }
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
        // Continue with deletion even if email fails
      }
    }
    
    // Delete the presentation slot
    await Presentation.findByIdAndDelete(presentationId);
    
    res.status(200).json({
      success: true,
      message: 'Presentation slot cancelled successfully'
    });
  } catch (error) {
    console.error('Error deleting presentation slot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAvailablePresentationSlots,
  getFacultyPresentationSlots,
  createPresentationSlot,
  bookPresentationSlot,
  deletePresentationSlot
};
