const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide event title'],
    trim: true
  },
  caption: {
    type: String,
    trim: true
  },
  date: {
    type: String,
    required: [true, 'Please provide event date']
  },
  formLink: {
    type: String,
    trim: true
  },
  galleryLink: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  }
}, { _id: false });

const ClubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide club name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please provide club description'],
    trim: true
  },
  image: {
    type: String,
    default: '/api/placeholder/150/150'
  },
  head: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  viceHead: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  instagram: {
    type: String,
    trim: true
  },
  linkedin: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  location: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide club category'],
    enum: ['technical', 'non-technical', 'arts', 'sports']
  },
  mentors: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    }
  }],
  members: {
    type: [memberSchema],
    default: []
  },
  events: [EventSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Club', ClubSchema);