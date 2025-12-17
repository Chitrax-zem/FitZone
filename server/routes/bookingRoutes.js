// server/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Class = require('../models/Class');
const Trainer = require('../models/Trainer');

// Create a new booking
router.post('/', auth, async (req, res) => {
  try {
    const {
      bookingType,
      class: classDetails,
      trainer,
      date,
      time,
      day,
      participants,
      sessionType,
      userDetails,
      amount
    } = req.body;

    // Validate required fields
    if (!bookingType || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Booking type, date, and time are required'
      });
    }

    // Get user details
    const user = await User.findById(req.user.id).select('name email phone');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create booking object
    const bookingData = {
      user: req.user.id,
      bookingType,
      date: new Date(date),
      time,
      day,
      participants: participants || 1,
      userDetails: {
        name: userDetails?.name || user.name,
        email: userDetails?.email || user.email,
        phone: userDetails?.phone || user.phone || '',
        notes: userDetails?.notes || ''
      },
      amount: amount || 0,
      status: 'confirmed',
      paymentStatus: 'pending'
    };

    // Add type-specific details
    if (bookingType === 'class' && classDetails) {
      bookingData.class = classDetails;
      bookingData.sessionType = 'class';
      
      // Update class availability if we have a class model
      if (classDetails._id) {
        const classDoc = await Class.findById(classDetails._id);
        if (classDoc) {
          classDoc.bookedSpots += participants || 1;
          await classDoc.save();
        }
      }
    } else if (bookingType === 'trainer' && trainer) {
      bookingData.trainer = trainer;
      bookingData.sessionType = sessionType || 'personal';
    }

    // Check for existing booking conflicts
    const existingBooking = await Booking.findOne({
      user: req.user.id,
      date: bookingData.date,
      time: time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have a booking at this time'
      });
    }

    // Create the booking
    const booking = new Booking(bookingData);
    await booking.save();

    // Populate user details for response
    await booking.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking',
      error: error.message
    });
  }
});

// Get user's bookings
router.get('/', auth, async (req, res) => {
  try {
    const { status, bookingType, limit = 50, page = 1 } = req.query;

    // Build query
    const query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (bookingType) {
      query.bookingType = bookingType;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch bookings
    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: bookings.length,
        totalRecords: total
      }
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: error.message
    });
  }
});

// Cancel a booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Instead of deleting, mark as cancelled
    booking.status = 'cancelled';
    await booking.save();

    // If it's a class booking, update class availability
    if (booking.bookingType === 'class' && booking.class && booking.class._id) {
      const classDoc = await Class.findById(booking.class._id);
      if (classDoc) {
        classDoc.bookedSpots -= booking.participants;
        await classDoc.save();
      }
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking',
      error: error.message
    });
  }
});

module.exports = router;
