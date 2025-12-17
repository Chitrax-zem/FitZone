// server/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  bookingType: {
    type: String,
    enum: ['class', 'trainer', 'facility'],
    required: true,
    index: true
  },
  // For class bookings
  class: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    type: String,
    trainer: String,
    difficulty: String,
    duration: Number,
    maxParticipants: Number
  },
  // For trainer bookings
  trainer: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    specialization: String
  },
  // Common fields
  date: {
    type: Date,
    required: true,
    index: true
  },
  time: {
    type: String,
    required: true
  },
  day: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'confirmed',
    index: true
  },
  participants: {
    type: Number,
    default: 1,
    min: 1
  },
  sessionType: {
    type: String,
    enum: ['personal', 'group', 'class', 'assessment', 'nutrition']
  },
  userDetails: {
    name: String,
    email: String,
    phone: String,
    notes: String
  },
  bookedAt: {
    type: Date,
    default: Date.now
  },
  // Payment related fields
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  amount: {
    type: Number,
    default: 0
  },
  cancelledAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

// Indexes for efficient queries
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'class._id': 1 });
bookingSchema.index({ 'trainer._id': 1 });

// Prevent duplicate bookings
bookingSchema.index(
  { user: 1, date: 1, time: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: { $ne: 'cancelled' } }
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
