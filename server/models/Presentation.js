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

// Add any missing schema definitions if they don't exist
// Ensure proper slot schemas for IDs

// When creating slots, ensure each slot gets both MongoDB _id and a custom id:
function generateTimeSlots(startTime, endTime, periodStart, periodEnd, duration, buffer) {
  const slots = [];
  const days = [];
  
  // Generate array of dates between start and end date
  let currentDate = new Date(periodStart);
  const endDate = new Date(periodEnd);
  
  // ...existing code...
  
  // For each day, generate slots
  days.forEach(day => {
    // ...existing code...
    
    // When creating slot objects:
    const slot = {
      id: mongoose.Types.ObjectId().toString(), // Ensure each slot has a string ID
      time: new Date(slotTime),
      booked: false,
      status: 'available'
      // ...other slot properties
    };
    // MongoDB will auto-generate _id when inserted into collection
    
    slots.push(slot);
    // ...existing code...
  });
  
  return slots;
}

module.exports = mongoose.model('Presentation', PresentationSchema);
