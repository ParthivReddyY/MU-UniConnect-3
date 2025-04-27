const mongoose = require('mongoose');

const PresentationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facultyName: {
    type: String
  },
  hostDepartment: {
    type: String
  },
  venue: {
    type: String,
    required: true
  },
  registrationPeriod: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  presentationPeriod: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  participationType: {
    type: String,
    enum: ['individual', 'team'],
    default: 'individual'
  },
  teamSizeMin: {
    type: Number,
    default: 1
  },
  teamSizeMax: {
    type: Number,
    default: 1
  },
  targetAudience: {
    year: [{
      type: String,
      trim: true
    }],
    school: [{
      type: String,
      trim: true
    }],
    department: [{
      type: String,
      trim: true
    }]
  },
  customGradingCriteria: {
    type: Boolean,
    default: false
  },
  gradingCriteria: [{
    name: String,
    weight: Number
  }],
  slotConfig: {
    duration: {
      type: Number,
      required: true,
      default: 20 // in minutes
    },
    buffer: {
      type: Number,
      default: 5 // in minutes
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  slots: [
    {
      id: String,
      time: Date,
      booked: {
        type: Boolean,
        default: false
      },
      bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      bookedAt: Date,
      status: {
        type: String,
        enum: ['available', 'booked', 'in-progress', 'completed'],
        default: 'available'
      },
      topic: String,
      teamName: String,
      teamMembers: [{
        name: String,
        email: String,
        studentId: String
      }],
      feedback: String,
      grades: mongoose.Schema.Types.Mixed,
      totalScore: Number
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Presentation', PresentationSchema);
