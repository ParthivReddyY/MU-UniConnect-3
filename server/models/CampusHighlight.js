const mongoose = require('mongoose');

const CampusHighlightSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [300, 'Description cannot be more than 300 characters']
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL']
  },
  link: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'fas fa-building'
  },
  active: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('CampusHighlight', CampusHighlightSchema);