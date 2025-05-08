const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    default: 'bell'
  },
  buttonText: {
    type: String,
    default: 'Learn More'
  },
  link: {
    type: String,
    default: '/college?tab=news'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0  // Higher numbers will be shown first
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // Default 30 days from creation
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Pre-save middleware to ensure buttonText is never empty
announcementSchema.pre('save', function(next) {
  if (!this.buttonText || this.buttonText.trim() === '') {
    this.buttonText = 'Learn More';
  }
  next();
});

module.exports = mongoose.model('Announcement', announcementSchema);