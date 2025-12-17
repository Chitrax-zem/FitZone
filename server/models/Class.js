// server/models/Class.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  trainer: {
    type: String,
    required: true,
    trim: true
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer'
  },
  type: {
    type: String,
    required: true,
    enum: ['Yoga', 'Cardio', 'Strength', 'HIIT', 'Dance']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
  },
  duration: {
    type: Number,
    required: true
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  time: {
    type: String,
    required: true
  },
  maxSpots: {
    type: Number,
    required: true
  },
  bookedSpots: {
    type: Number,
    default: 0
  }
});

// Virtual for spots left
classSchema.virtual('spotsLeft').get(function() {
  return this.maxSpots - this.bookedSpots;
});

// Include virtuals when converting to JSON
classSchema.set('toJSON', { virtuals: true });
classSchema.set('toObject', { virtuals: true });

const Class = mongoose.model('Class', classSchema);
module.exports = Class;
