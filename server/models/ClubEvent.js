const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Club Event Schema
const ClubEventSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  summary: {
    type: String,
    trim: true
  },
  clubId: {
    type: Schema.Types.ObjectId,
    ref: 'Club',
    required: [true, 'Associated club is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    default: '18:00'
  },
  endTime: {
    type: String
  },
  venue: {
    type: String,
    default: 'TBD'
  },
  image: {
    type: String
  },
  categories: {
    type: [String],
    default: ['General']
  },
  maxParticipants: {
    type: Number
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  registrationRequired: {
    type: Boolean,
    default: false
  },
  registrationDeadline: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Enable virtuals
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual for checking if registration is open
ClubEventSchema.virtual('isRegistrationOpen').get(function() {
  if (!this.registrationRequired) return false;
  if (!this.registrationDeadline) return true;
  return new Date() < this.registrationDeadline;
});

// Add a virtual for checking if event is upcoming
ClubEventSchema.virtual('isUpcoming').get(function() {
  return new Date() < this.date;
});

// Create the model
const ClubEvent = mongoose.model('ClubEvent', ClubEventSchema);

module.exports = { ClubEvent };