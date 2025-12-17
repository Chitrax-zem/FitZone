// server/controllers/classController.js
const Class = require('../models/Class');
const Booking = require('../models/Booking');

// Get all classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get classes by day
exports.getClassesByDay = async (req, res) => {
  try {
    const { day } = req.params;
    const classes = await Class.find({ day });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Book a class
exports.bookClass = async (req, res) => {
  try {
    const { classId, participants, notes } = req.body;
    const userId = req.user.id;
    
    // Find the class
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if there are enough spots
    if (classItem.spotsLeft < participants) {
      return res.status(400).json({ message: 'Not enough spots available' });
    }
    
    // Create booking
    const booking = new Booking({
      user: userId,
      bookingType: 'class',
      class: classId,
      date: new Date(), // This should be derived from class day and current week
      participants,
      notes
    });
    
    await booking.save();
    
    // Update class booked spots
    classItem.bookedSpots += participants;
    await classItem.save();
    
    res.status(201).json({
      message: 'Class booked successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
