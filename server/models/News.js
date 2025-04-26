const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  excerpt: {
    type: String,
    required: [true, 'Please provide an excerpt'],
    trim: true,
    maxlength: [300, 'Excerpt cannot be more than 300 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: {
      values: ['announcement', 'academic', 'campus', 'placement', 'infrastructure', 'research'],
      message: '{VALUE} is not supported as a category'
    }
  },
  categoryLabel: {
    type: String,
    required: [true, 'Please provide a category label']
  },
  date: {
    type: String,
    required: [true, 'Please provide a formatted date']
  },
  author: {
    type: String,
    required: [true, 'Please provide an author name']
  },
  featured: {
    type: Boolean,
    default: false
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

// Update the timestamp when document is updated
NewsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('News', NewsSchema);