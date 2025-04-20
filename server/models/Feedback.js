const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required since feedback can be anonymous
  },
  category: {
    type: String,
    required: true,
    enum: ['app', 'academic', 'hostel', 'faculty', 'events', 'facilities', 'other']
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'in-progress', 'resolved', 'rejected']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  contactEmail: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Only validate if provided
        if (!v) return true;
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  contactPhone: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  adminResponse: {
    type: String,
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
