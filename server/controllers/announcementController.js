const Announcement = require('../models/Announcement');

// Get all active announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const currentDate = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      expiresAt: { $gt: currentDate }
    })
    .sort({ priority: -1, createdAt: -1 }) // Sort by priority (high to low), then by date (newest first)
    .limit(10); // Limit to 10 announcements
    
    return res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching announcements',
      error: error.message
    });
  }
};

// Get a single announcement by ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      announcement
    });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching announcement',
      error: error.message
    });
  }
};

// Create a new announcement (admin only)
exports.createAnnouncement = async (req, res) => {
  try {
    const { text, icon, buttonText, link, isActive, priority, expiresAt } = req.body;
    
    // Basic validation
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Announcement text is required'
      });
    }
    
    // Create the announcement
    const newAnnouncement = new Announcement({
      text,
      icon: icon || 'bell',
      buttonText: buttonText || 'Learn More',
      link: link || '/college?tab=news',
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || 0,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: req.user ? req.user._id : undefined
    });
    
    await newAnnouncement.save();
    
    return res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement: newAnnouncement
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating announcement',
      error: error.message
    });
  }
};

// Update an announcement (admin only)
exports.updateAnnouncement = async (req, res) => {
  try {
    const { text, icon, buttonText, link, isActive, priority, expiresAt } = req.body;
    
    // Find the announcement
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    // Update fields
    if (text !== undefined) announcement.text = text;
    if (icon !== undefined) announcement.icon = icon;
    if (buttonText !== undefined) announcement.buttonText = buttonText;
    if (link !== undefined) announcement.link = link;
    if (isActive !== undefined) announcement.isActive = isActive;
    if (priority !== undefined) announcement.priority = priority;
    if (expiresAt !== undefined) announcement.expiresAt = new Date(expiresAt);
    
    await announcement.save();
    
    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating announcement',
      error: error.message
    });
  }
};

// Delete an announcement (admin only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    await announcement.deleteOne();
    
    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting announcement',
      error: error.message
    });
  }
};

// Create default announcements
exports.createDefaultAnnouncements = async () => {
  try {
    const count = await Announcement.countDocuments();
    
    // Only create default announcements if there are none in the database
    if (count === 0) {
      const defaultAnnouncements = [
        {
          text: 'May 2025 Graduation Ceremony scheduled for May 15th - Check venue details',
          icon: 'graduation-cap',
          buttonText: 'View Details',
          link: '/college?tab=news&category=academic',
          priority: 3,
          isActive: true
        },
        {
          text: 'Summer Internship Fair on May 10th - Over 50 companies participating',
          icon: 'calendar-alt',
          buttonText: 'Register Now',
          link: '/college?tab=events&event=internship-fair',
          priority: 2,
          isActive: true
        },
        {
          text: 'Deadline for summer research grant applications closes on May 20th',
          icon: 'star',
          buttonText: 'Apply Now',
          link: '/college?tab=research&section=grants',
          priority: 1,
          isActive: true
        }
      ];
      
      await Announcement.insertMany(defaultAnnouncements);
      console.log('Default announcements created successfully');
    }
  } catch (error) {
    console.error('Error creating default announcements:', error);
  }
};