// filepath: /Users/jkreddy/Github Repo/Uniconnect/Untitled/server/controllers/clubController.js
const Club = require('../models/Club');
const { StatusCodes } = require('http-status-codes');

// Get all clubs
exports.getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find({});
    res.status(StatusCodes.OK).json({ clubs, count: clubs.length });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

// Get a single club by ID
exports.getClubById = async (req, res) => {
  try {
    const { id: clubId } = req.params;
    const club = await Club.findById(clubId);
    
    if (!club) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: `No club with id: ${clubId}` });
    }
    
    res.status(StatusCodes.OK).json({ club });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

// Create a new club
exports.createClub = async (req, res) => {
  try {
    req.body.createdBy = req.user.userId;
    const club = await Club.create(req.body);
    res.status(StatusCodes.CREATED).json({ club });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
  }
};

// Update a club
exports.updateClub = async (req, res) => {
  try {
    const clubId = req.params.id;
    
    // Check if club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    
    // Check permissions (admin can edit any, club head can only edit their own)
    if (req.user.role !== 'admin' && 
        (req.user.role !== 'clubs' || req.user.clubManaging !== clubId.toString())) {
      return res.status(403).json({ message: 'Not authorized to update this club' });
    }
    
    // Update club record
    const updatedClub = await Club.findByIdAndUpdate(
      clubId,
      req.body,
      { new: true }
    );
    
    res.status(200).json(updatedClub);
  } catch (error) {
    console.error('Error in updateClub:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a club
exports.deleteClub = async (req, res) => {
  try {
    const { id: clubId } = req.params;
    const club = await Club.findByIdAndDelete(clubId);
    
    if (!club) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: `No club with id: ${clubId}` });
    }
    
    res.status(StatusCodes.OK).json({ msg: "Club deleted successfully" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

// Add an event to a club
exports.addEvent = async (req, res) => {
  try {
    const { id: clubId } = req.params;
    const club = await Club.findById(clubId);
    
    if (!club) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: `No club with id: ${clubId}` });
    }
    
    club.events.push(req.body);
    await club.save();
    
    res.status(StatusCodes.OK).json({ club });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
  }
};

// Delete an event from a club
exports.deleteEvent = async (req, res) => {
  try {
    const { clubId, eventId } = req.params;
    const club = await Club.findById(clubId);
    
    if (!club) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: `No club with id: ${clubId}` });
    }
    
    club.events = club.events.filter(event => event._id.toString() !== eventId);
    await club.save();
    
    res.status(StatusCodes.OK).json({ club });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
  }
};

// Get clubs by category
exports.getClubsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const clubs = await Club.find({ category });
    
    res.status(StatusCodes.OK).json({ clubs, count: clubs.length });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};