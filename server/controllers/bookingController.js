// server/controllers/bookingController.js
const Booking = require('../models/Booking');
const Class = require('../models/Class');
const { errorResponse, successResponse } = require('../utils/responseHandler');

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const bookings = await Booking.find({ user: userId })
      .populate('class')
      .populate('trainer')
      .sort({ date: -1 });
    
    return successResponse(res, bookings);
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    
    // Find the booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }
    
    // Check if the booking belongs to the user
    if (booking.user.toString() !== userId) {
      return errorResponse(res, 'Not authorized', 401);
    }
    
    // Check if the booking is already cancelled
    if (booking.status === 'cancelled') {
      return errorResponse(res, 'Booking is already cancelled', 400);
    }
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save();
    
    // If it's a class booking, update the class spots
    if (booking.bookingType === 'class' && booking.class) {
      const classItem = await Class.findById(booking.class);
      if (classItem) {
        classItem.bookedSpots -= booking.participants;
        await classItem.save();
      }
    }
    
    return successResponse(res, booking);
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};
      

export const bookingService = {
  // Book a class
  bookClass: async (classData, date, time, participants = 1, notes = '') => {
    try {
      const bookingData = {
        bookingType: 'class',
        class: {
          name: classData.name,
          type: classData.type,
          trainer: classData.trainer,
          difficulty: classData.difficulty,
          duration: classData.duration,
          maxParticipants: classData.maxParticipants || 20
        },
        date: date,
        time: time,
        day: getDayFromDate(date),
        participants: participants,
        sessionType: 'class',
        userDetails: {
          notes: notes
        },
        amount: classData.price || 0
      };

      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error booking class:', error);
      throw error;
    }
  },

  // Book a trainer session
  bookTrainer: async (trainerData, date, time, sessionType, notes = '') => {
    try {
      const bookingData = {
        bookingType: 'trainer',
        trainer: {
          name: trainerData.name,
          specialization: trainerData.specialization
        },
        date: date,
        time: time,
        day: getDayFromDate(date),
        participants: 1,
        sessionType: sessionType,
        userDetails: {
          notes: notes
        },
        amount: trainerData.hourlyRate || 0
      };

      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error booking trainer:', error);
      throw error;
    }
  },

  // Get user's bookings
  getUserBookings: async () => {
    try {
      const response = await api.get('/bookings');
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await api.delete(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }
};

// Helper function to get day name from date
function getDayFromDate(dateString) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateString);
  return days[date.getDay()];
}