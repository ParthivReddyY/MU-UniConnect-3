const Appointment = require('../models/Appointment');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to safely compare IDs that may be strings or ObjectIds
const compareIds = (id1, id2) => {
  // Convert to string and compare
  const strId1 = id1 ? id1.toString() : id1;
  const strId2 = id2 ? id2.toString() : id2;
  return strId1 === strId2;
};

// Create a new appointment
const createAppointment = async (req, res) => {
  try {
    console.log('Appointment creation request received:', JSON.stringify(req.body, null, 2));
    console.log('User making request:', req.user);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to create appointments'
      });
    }
    
    // Create appointment data from request body
    // Fixed issue: Accessing userId correctly from the authenticated user object
    const appointmentData = {
      student: {
        userId: req.user.userId || req.user._id, // Try both possible locations of userId
        name: req.user.name || 'Student',
        email: req.user.email || 'student@example.com',
        department: req.user.department || 'Unknown Department',
        rollNumber: req.user.studentId || 'Unknown'
      },
      faculty: {
        userId: req.body.facultyInfo?.userId || req.body.facultyInfo?._id || req.body.facultyInfo?.id,
        name: req.body.facultyInfo?.name || 'Faculty',
        email: req.body.facultyInfo?.email || 'faculty@example.com',
        department: req.body.facultyInfo?.department || 'Unknown Department'
      },
      course: req.body.course,
      appointment_date: req.body.appointment_date,
      appointment_time: req.body.appointment_time,
      duration: req.body.duration,
      custom_duration: req.body.custom_duration,
      meeting_mode: req.body.meeting_mode,
      priority: req.body.priority,
      reason: req.body.reason,
      phone: req.body.phone,
      status: 'pending',
      alternative_slots: []
    };
    
    // Add alternative slots if provided
    if (req.body.alt_date_1 && req.body.alt_time_1) {
      appointmentData.alternative_slots.push({
        date: req.body.alt_date_1,
        time: req.body.alt_time_1
      });
    }
    
    if (req.body.alt_date_2 && req.body.alt_time_2) {
      appointmentData.alternative_slots.push({
        date: req.body.alt_date_2,
        time: req.body.alt_time_2
      });
    }
    
    // Verify the presence of required fields before creating the appointment
    if (!appointmentData.student.userId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is missing',
        error: 'Required field student.userId is missing'
      });
    }
    
    // Create and save appointment
    const appointment = new Appointment(appointmentData);
    
    // Validate the appointment before saving
    try {
      await appointment.validate();
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment data',
        error: validationError.message
      });
    }
    
    // Save if validation passed
    await appointment.save();
    
    console.log('Appointment saved successfully with ID:', appointment._id);
    
    res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully',
      appointment
    });
  } catch (error) {
    console.error('Error in createAppointment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    // Only admin can see all appointments
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to access all appointments' 
      });
    }
    
    const appointments = await Appointment.find().sort({ created_at: -1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Error in getAllAppointments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get appointments for a faculty member
const getFacultyAppointments = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("Faculty appointments requested by user ID:", userId);
    console.log("User role:", req.user.role);
    
    // Only faculty or admin can retrieve faculty appointments
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access faculty appointments'
      });
    }
    
    // Enhanced querying strategy that handles more ID formats
    let query = {};
    const userIdStr = userId.toString();
    
    // Check if we have email for fallback
    const userEmail = req.user.email;
    
    // Build a comprehensive query to match different ID formats
    query = {
      $or: [
        { 'faculty.userId': userId },
        { 'faculty.userId': userIdStr },
        { 'faculty._id': userId },
        { 'faculty._id': userIdStr },
        { 'faculty.id': userId },
        { 'faculty.id': userIdStr }
      ]
    };
    
    // If email is available, add it to the query options
    if (userEmail) {
      query.$or.push({ 'faculty.email': userEmail });
    }
    
    console.log("Query used:", JSON.stringify(query));
    
    // Find all appointments with the improved query
    const appointments = await Appointment.find(query).sort({ appointment_date: 1, appointment_time: 1 });
    
    console.log(`Found ${appointments.length} appointments for faculty ID: ${userIdStr}`);
    
    // If appointments were found via any method, return them
    if (appointments.length > 0) {
      return res.status(200).json({
        success: true,
        count: appointments.length,
        appointments
      });
    }
    
    // If still no appointments and we have an email, try a direct email search
    if (appointments.length === 0 && userEmail) {
      console.log(`No appointments found by ID. Trying email fallback search with: ${userEmail}`);
      const emailAppointments = await Appointment.find({
        'faculty.email': userEmail
      }).sort({ appointment_date: 1, appointment_time: 1 });
      
      console.log(`Found ${emailAppointments.length} appointments by email match`);
      
      return res.status(200).json({
        success: true,
        count: emailAppointments.length,
        appointments: emailAppointments
      });
    }
    
    // Return empty array if nothing found
    return res.status(200).json({
      success: true,
      count: 0,
      appointments: []
    });
  } catch (error) {
    console.error('Error in getFacultyAppointments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get appointments made by a student
const getStudentAppointments = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Find all appointments where student.userId matches the authenticated user's ID
    const appointments = await Appointment.find({
      'student.userId': userId
    }).sort({ created_at: -1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Error in getStudentAppointments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get a single appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }
    
    // Check authorization: only the student who created the appointment, 
    // the faculty it's for, or an admin can view it
    if (
      role !== 'admin' && 
      !compareIds(appointment.student.userId, userId) && 
      !compareIds(appointment.faculty.userId, userId)
    ) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this appointment' 
      });
    }
    
    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Error in getAppointmentById:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Consolidate authorization checks
const checkAppointmentAuthorization = (appointment, userId, role) => {
  if (role === 'student') {
    if (status !== 'cancelled') {
      return { authorized: false, message: 'Students can only cancel appointments' };
    }
    
    if (!compareIds(appointment.student.userId, userId)) {
      return { authorized: false, message: 'You can only cancel your own appointments' };
    }
  } else if (role === 'faculty') {
    const isFacultyMatch = compareIds(appointment.faculty.userId, userId) || 
                          (req.user.email && appointment.faculty.email === req.user.email);
    
    if (!isFacultyMatch) {
      return { authorized: false, message: 'You can only manage appointments assigned to you' };
    }
  }
  
  return { authorized: true };
}

// Update appointment status (approve, reject, cancel)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, faculty_notes, meeting_link } = req.body;
    const { userId, role } = req.user;
    
    // Validate the status value
    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Authorization checks using our safe compareIds function
    // 1. Student can only cancel their own appointments
    // 2. Faculty can approve/reject/complete appointments assigned to them
    // 3. Admin can perform any action
    const authorization = checkAppointmentAuthorization(appointment, userId, role);
    if (!authorization.authorized) {
      return res.status(403).json({
        success: false,
        message: authorization.message
      });
    }
    
    // Update the appointment
    appointment.status = status;
    if (faculty_notes) {
      appointment.faculty_notes = faculty_notes;
    }
    if (meeting_link) {
      appointment.meeting_link = meeting_link;
    }
    appointment.updated_at = Date.now();
    
    await appointment.save();
    
    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment
    });
  } catch (error) {
    console.error('Error in updateAppointmentStatus:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete an appointment (admin only)
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only admin can delete appointments
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only administrators can delete appointments' 
      });
    }
    
    const appointment = await Appointment.findByIdAndDelete(id);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteAppointment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get appointment statistics for a faculty member
const getFacultyAppointmentStats = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("Faculty stats requested by user ID:", userId);
    
    // Enhanced querying strategy that handles more ID formats
    let query = {};
    const userIdStr = userId.toString();
    
    // Check if we have email for fallback
    const userEmail = req.user.email;
    
    // Build a comprehensive query to match different ID formats
    query = {
      $or: [
        { 'faculty.userId': userId },
        { 'faculty.userId': userIdStr },
        { 'faculty._id': userId },
        { 'faculty._id': userIdStr },
        { 'faculty.id': userId },
        { 'faculty.id': userIdStr }
      ]
    };
    
    // If email is available, add it to the query options
    if (userEmail) {
      query.$or.push({ 'faculty.email': userEmail });
    }
    
    console.log("Query used for stats:", JSON.stringify(query));

    // Get appointments by status count
    const statusGroups = await Appointment.aggregate([
      { $match: query },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    console.log(`Found ${statusGroups.length} status groups for faculty ID: ${userIdStr}`);
    
    // Get upcoming appointments (approved and not yet completed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingQuery = {
      ...query,
      status: 'approved',
      appointment_date: { $gte: today.toISOString() }
    };
    
    const upcoming = await Appointment.find(upcomingQuery)
      .sort({ appointment_date: 1, appointment_time: 1 })
      .limit(5);
    
    console.log(`Found ${upcoming.length} upcoming appointments for faculty ID: ${userIdStr}`);

    // If no status groups found with ID-based query and we have email, try direct email search
    if (statusGroups.length === 0 && userEmail) {
      console.log(`No appointments found by ID for stats. Trying email fallback with: ${userEmail}`);
      
      // Check appointments by email
      const emailAppointments = await Appointment.find({
        'faculty.email': userEmail
      });
      
      console.log(`Found ${emailAppointments.length} appointments by email match`);
      
      if (emailAppointments.length > 0) {
        // Re-run the aggregation with email-only query
        const emailQuery = { 'faculty.email': userEmail };
        
        const emailStatusGroups = await Appointment.aggregate([
          { $match: emailQuery },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        
        console.log(`Found ${emailStatusGroups.length} status groups by email match`);
        
        // Get upcoming appointments by email
        const emailUpcomingQuery = {
          'faculty.email': userEmail,
          status: 'approved',
          appointment_date: { $gte: today.toISOString() }
        };
        
        const emailUpcoming = await Appointment.find(emailUpcomingQuery)
          .sort({ appointment_date: 1, appointment_time: 1 })
          .limit(5);
        
        // Format the status data
        const stats = {
          pending: 0,
          approved: 0,
          rejected: 0,
          completed: 0,
          cancelled: 0
        };
        
        emailStatusGroups.forEach(group => {
          if (stats.hasOwnProperty(group._id)) {
            stats[group._id] = group.count;
          }
        });
        
        return res.status(200).json({
          success: true,
          stats,
          upcoming: emailUpcoming
        });
      }
    }

    // Format the status data
    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0
    };
    
    statusGroups.forEach(group => {
      if (stats.hasOwnProperty(group._id)) {
        stats[group._id] = group.count;
      }
    });
    
    res.status(200).json({
      success: true,
      stats,
      upcoming
    });
  } catch (error) {
    console.error('Error in getFacultyAppointmentStats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getFacultyAppointments,
  getStudentAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
  getFacultyAppointmentStats
};