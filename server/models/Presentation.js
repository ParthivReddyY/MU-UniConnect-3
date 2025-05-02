const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Team member schema for presentation slots
const TeamMemberSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

// File attachment schema
const FileAttachmentSchema = new Schema({
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Slot schema
const SlotSchema = new Schema({
  id: {
    type: String
  },
  time: {
    type: Date,
    required: true
  },
  booked: {
    type: Boolean,
    default: false
  },
  bookedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  bookedAt: {
    type: Date
  },
  teamName: {
    type: String
  },
  topic: {
    type: String
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'in-progress', 'completed'],
    default: 'available'
  },
  teamMembers: [TeamMemberSchema],
  fileAttachment: FileAttachmentSchema,
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  // Grading fields
  grades: {
    type: Schema.Types.Mixed,
    default: {}
  },
  individualGrades: {
    type: Schema.Types.Mixed,
    default: {}
  },
  feedback: {
    type: String
  },
  totalScore: {
    type: Number
  }
});

// Grading criteria schema
const GradingCriteriaSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
});

// Main presentation schema
const PresentationSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  faculty: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facultyName: {
    type: String,
    required: true
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
  slotConfig: {
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    buffer: {
      type: Number,
      default: 5
    }
  },
  targetAudience: {
    year: [Number],
    school: [String],
    department: [String]
  },
  customGradingCriteria: {
    type: Boolean,
    default: false
  },
  gradingCriteria: [GradingCriteriaSchema],
  slots: [SlotSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add method to get slot by ID
PresentationSchema.methods.getSlotById = function(slotId) {
  if (!slotId) return null;
  
  // Check for both _id and custom id fields
  return this.slots.find(slot => 
    (slot._id && slot._id.toString() === slotId) || 
    (slot.id && slot.id === slotId)
  );
};

// Add virtual for slot statistics
PresentationSchema.virtual('slotStats').get(function() {
  const totalCount = this.slots.length;
  const bookedCount = this.slots.filter(slot => slot.booked).length;
  const inProgressCount = this.slots.filter(slot => slot.status === 'in-progress').length;
  const completedCount = this.slots.filter(slot => slot.status === 'completed').length;
  const availableCount = totalCount - bookedCount;

  return {
    totalCount,
    bookedCount,
    inProgressCount,
    completedCount,
    availableCount
  };
});

const Presentation = mongoose.model('Presentation', PresentationSchema);

module.exports = Presentation;
