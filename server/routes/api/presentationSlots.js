const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const PresentationSlot = require('../../models/PresentationSlot');
const { check, validationResult } = require('express-validator');

// @route   GET api/presentation-slots
// @desc    Get all presentation slots
// @access  Public
router.get('/', async (req, res) => {
  try {
    const slots = await PresentationSlot.find().sort({ date: 1, startTime: 1 });
    res.json(slots);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/presentation-slots/faculty
// @desc    Get presentation slots created by a faculty member
// @access  Private (Faculty/Admin only)
router.get('/faculty', auth, async (req, res) => {
  try {
    // Check if user is faculty or admin
    if (!['faculty', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const slots = await PresentationSlot.find({ 
      'host.userId': req.user.userId 
    }).sort({ date: 1, startTime: 1 });
    
    res.json(slots);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/presentation-slots/:id
// @desc    Get presentation slot by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const slot = await PresentationSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ msg: 'Presentation slot not found' });
    }
    
    res.json(slot);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Presentation slot not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/presentation-slots
// @desc    Create a presentation slot
// @access  Private (Faculty/Admin only)
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('targetYear', 'Target year is required').not().isEmpty(),
      check('targetDepartment', 'Target department is required').not().isEmpty(),
      check('date', 'Date is required').not().isEmpty(),
      check('startTime', 'Start time is required').not().isEmpty(),
      check('endTime', 'End time is required').not().isEmpty(),
      check('venue', 'Venue is required').not().isEmpty(),
      check('duration', 'Duration is required').isNumeric()
    ]
  ],
  async (req, res) => {
    // Check if user is faculty or admin
    if (!['faculty', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Not authorized to create presentation slots' });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title,
        description,
        targetYear,
        targetDepartment,
        date,
        startTime,
        endTime,
        venue,
        duration,
        bufferTime = 0
      } = req.body;

      // Create new presentation slot
      const newSlot = new PresentationSlot({
        host: {
          userId: req.user.userId,
          name: req.user.name,
          email: req.user.email,
          department: req.user.department
        },
        title,
        description,
        targetYear,
        targetDepartment,
        date,
        startTime,
        endTime,
        venue,
        duration,
        bufferTime,
        status: 'available'
      });

      const slot = await newSlot.save();
      res.json(slot);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/presentation-slots/:id
// @desc    Update a presentation slot
// @access  Private (Faculty owner or Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const slot = await PresentationSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ msg: 'Presentation slot not found' });
    }
    
    // Check if user is the owner or admin
    if (
      slot.host.userId.toString() !== req.user.userId.toString() && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ msg: 'Not authorized to update this slot' });
    }

    // Don't allow updates if slot is already booked
    if (slot.status === 'booked' && req.body.status !== 'cancelled') {
      return res.status(400).json({ 
        msg: 'Cannot update details of a booked slot. You can only cancel it.' 
      });
    }

    const updateFields = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (value !== null && value !== undefined) {
        updateFields[key] = value;
      }
    }

    const updatedSlot = await PresentationSlot.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    res.json(updatedSlot);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Presentation slot not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/presentation-slots/:id
// @desc    Delete a presentation slot
// @access  Private (Faculty owner or Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const slot = await PresentationSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ msg: 'Presentation slot not found' });
    }
    
    // Check if user is the owner or admin
    if (
      slot.host.userId.toString() !== req.user.userId.toString() && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ msg: 'Not authorized to delete this slot' });
    }

    // Don't allow deletion if slot is already booked
    if (slot.status === 'booked') {
      return res.status(400).json({ 
        msg: 'Cannot delete a booked slot. Cancel it first.' 
      });
    }

    await slot.remove();
    res.json({ msg: 'Presentation slot removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Presentation slot not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/presentation-slots/:id/book
// @desc    Book a presentation slot
// @access  Private (Students only)
router.put('/:id/book', auth, async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can book presentation slots' });
    }

    const slot = await PresentationSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ msg: 'Presentation slot not found' });
    }
    
    // Check if slot is already booked
    if (slot.status !== 'available') {
      return res.status(400).json({ msg: 'This slot is not available for booking' });
    }

    // Update slot status and add booking details
    slot.status = 'booked';
    slot.bookedBy = {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email,
      department: req.user.department,
      rollNumber: req.user.studentId || 'Unknown'
    };

    await slot.save();
    res.json(slot);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Presentation slot not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
