// server/models/Trainer.js
const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  certifications: [{
    type: String,
    trim: true
  }],
  stats: {
    clients: Number,
    years: Number,
    rating: Number
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Trainer = mongoose.model('Trainer', trainerSchema);
module.exports = Trainer;
