const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for individual seat bookings
const SeatSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'booked'],
    default: 'available'
  }
});

// Schema for the seating map (array of rows)
const SeatingMapSchema = new Schema({
  rows: [[SeatSchema]]
});

// Schema for an event
const EventSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  caption: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    default: '19:00' // 7:00 PM default time
  },
  venue: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketPrice: {
    type: Number,
    default: 0
  },
  totalSeats: {
    type: Number,
    required: true
  },
  availableSeats: {
    type: Number
  },
  categories: [{
    type: String
  }],
  seatingMap: {
    type: [[SeatSchema]],
    default: undefined
  },
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

// Pre-save middleware to set availableSeats if not provided
EventSchema.pre('save', function(next) {
  if (this.isNew && this.availableSeats === undefined) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

// Schema for bookings
const BookingSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seats: [{
    type: String,
    required: true
  }],
  contactDetails: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    }
  },
  totalPrice: {
    type: Number,
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'confirmed'
  }
}, { 
  timestamps: true 
});

const Event = mongoose.model('Event', EventSchema);
const Booking = mongoose.model('Booking', BookingSchema);

module.exports = {
  Event,
  Booking
};