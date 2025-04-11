const mongoose = require('mongoose');

// Define the schema for alternative slots
const alternativeSlotSchema = new mongoose.Schema({
  date: {
    type: Date
  },
  time: {
    type: String
  }
}, { _id: false });

// Define the Appointment Schema
const AppointmentSchema = new mongoose.Schema({
  student: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    rollNumber: {
      type: String,
      required: true
    }
  },
  faculty: {
    userId: {
      type: mongoose.Schema.Types.Mixed, // Accept ObjectId or String
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    }
  },
  course: {
    type: String,
    required: true
  },
  appointment_date: {
    type: Date,
    required: true
  },
  appointment_time: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true,
    enum: ['default', 'custom', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60']
  },
  custom_duration: {
    type: Number,
    required: function() {
      return this.duration === 'custom';
    }
  },
  meeting_mode: {
    type: String,
    required: true,
    enum: ['in-person', 'virtual']
  },
  meeting_link: {
    type: String,
    required: function() {
      return this.status === 'approved' && this.meeting_mode === 'virtual';
    }
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High']
  },
  reason: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  faculty_notes: {
    type: String
  },
  alternative_slots: [alternativeSlotSchema],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
AppointmentSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Appointment', AppointmentSchema);