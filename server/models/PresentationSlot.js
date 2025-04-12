const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const presentationSlotSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  date: {
    type: Date
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String
  },
  duration: {
    type: Number,
    required: true,
    min: 5
  },
  bufferTime: {
    type: Number,
    default: 0
  },
  presentationType: {
    type: String,
    enum: ['single', 'team'],
    required: true
  },
  minTeamMembers: {
    type: Number,
    min: 2,
    default: 2
  },
  maxTeamMembers: {
    type: Number,
    min: 2,
    default: 5
  },
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
  status: {
    type: String,
    enum: ['available', 'booked', 'cancelled'],
    default: 'available'
  },
  bookedBy: {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    rollNumber: String,
    teamMembers: [{
      name: String,
      email: String,
      rollNumber: String
    }]
  },
  host: {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    email: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better search performance
presentationSlotSchema.index({ targetYear: 1, targetSchool: 1, targetDepartment: 1 });
presentationSlotSchema.index({ date: 1, status: 1 });
presentationSlotSchema.index({ 'host.user': 1 });

module.exports = mongoose.model('PresentationSlot', presentationSlotSchema);