const mongoose = require('mongoose');

const presentationSlotSchema = new mongoose.Schema({
  // Basic info
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  // Event ID to group slots together
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  // Venue and timing
  venue: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // Using string format like "13:30" for simplicity
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // In minutes
    required: true,
    min: 5
  },
  bufferTime: {
    type: Number, // Additional minutes between presentations
    default: 0
  },
  // Presentation type and requirements
  presentationType: {
    type: String,
    enum: ['single', 'team'],
    default: 'single'
  },
  minTeamMembers: {
    type: Number,
    min: 2,
    default: function() {
      return this.presentationType === 'team' ? 2 : undefined;
    },
    validate: {
      validator: function(v) {
        return this.presentationType !== 'team' || (v !== undefined && v >= 2);
      },
      message: props => 'minTeamMembers is required for team presentations and must be at least 2'
    }
  },
  maxTeamMembers: {
    type: Number,
    min: 2,
    default: function() {
      return this.presentationType === 'team' ? 5 : undefined;
    },
    validate: {
      validator: function(v) {
        return this.presentationType !== 'team' || 
               (v !== undefined && v >= (this.minTeamMembers || 2));
      },
      message: props => 'maxTeamMembers must be at least equal to minTeamMembers'
    }
  },
  // Target audience
  targetYear: {
    type: String,
    required: true
  },
  targetSchool: {
    type: String,
    required: true
  },
  targetDepartment: {
    type: String,
    required: true
  },
  // Host information
  host: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    email: String
  },
  // Slot status
  status: {
    type: String,
    enum: ['available', 'booked', 'cancelled'],
    default: 'available'
  },
  // Booking information
  bookedBy: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    rollNumber: String,
    teamMembers: [
      {
        name: String,
        email: String,
        id: String
      }
    ]
  }
}, { timestamps: true });

const PresentationSlot = mongoose.model('PresentationSlot', presentationSlotSchema);

module.exports = PresentationSlot;