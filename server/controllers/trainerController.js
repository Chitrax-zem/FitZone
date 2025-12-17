// server/controllers/trainerController.js
const Trainer = require('../models/Trainer');
const Booking = require('../models/Booking');

// Get all trainers
exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single trainer
exports.getTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Book a session with a trainer
exports.bookTrainerSession = async (req, res) => {
  try {
    const { trainerId, date, time, sessionType, participants, notes } = req.body;
    const userId = req.user.id;
    
    // Find the trainer
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    
    // Create booking
    const booking = new Booking({
      user: userId,
      bookingType: 'trainer',
      trainer: trainerId,
      date: new Date(date),
      time,
      sessionType,
      participants,
      notes
    });
    
    await booking.save();
    
    res.status(201).json({
      message: 'Trainer session booked successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
