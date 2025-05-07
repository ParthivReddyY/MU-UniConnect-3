const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    default: 'All day'
  },
  datetime: {
    type: String,
    required: true
  },
  endDatetime: {
    type: String
  },
  category: {
    type: String,
    default: 'DEFAULT'
  },
  location: {
    type: String,
    trim: true
  },
  isAllDay: {
    type: Boolean,
    default: false
  },
  repeat: {
    type: String,
    default: 'none'
  },
  description: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String
  },
  visibility: {
    type: String,
    enum: ['private', 'department', 'public'],
    default: 'public'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);