// components/BookingDashboard.jsx
import React, { useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Tag, X } from 'lucide-react';
import BookingContext from '../contexts/BookingContext';
import AuthContext from '../contexts/AuthContext';
import '../styles/booking-dashboard.css';

const BookingDashboard = () => {
  const { bookings, loading, error, fetchUserBookings, cancelBooking } = useContext(BookingContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId);
        alert('Booking cancelled successfully');
      } catch (error) {
        alert(error.message || 'Failed to cancel booking');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user) {
    return (
      <div className="booking-dashboard">
        <div className="login-prompt">
          <h3>Please log in to view your bookings</h3>
          <p>You need to be logged in to see your booking history and upcoming sessions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-dashboard">
      <h2 className="dashboard-title">My Bookings</h2>
      
      {loading && (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchUserBookings}>Try Again</button>
        </div>
      )}
      
      {!loading && bookings.length === 0 && (
        <div className="no-bookings">
          <h3>No bookings found</h3>
          <p>You haven't made any bookings yet. Check out our classes and trainers to get started!</p>
        </div>
      )}
      
      {bookings.length > 0 && (
        <div className="bookings-container">
          <h3>Upcoming Bookings</h3>
          <div className="bookings-list">
            {bookings
              .filter(booking => booking.status !== 'cancelled' && new Date(booking.date) >= new Date())
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(booking => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="booking-card"
                >
                  <div className={`booking-type-badge ${booking.bookingType}`}>
                    {booking.bookingType === 'class' ? 'Class' : 'Trainer Session'}
                  </div>
                  
                  <h4 className="booking-title">
                    {booking.bookingType === 'class' 
                      ? booking.class.name 
                      : `Session with ${booking.trainer.name}`}
                  </h4>
                  
                  <div className="booking-details">
                    <div className="booking-detail">
                      <Calendar className="booking-icon" />
                      <span>{formatDate(booking.date)}</span>
                    </div>
                    <div className="booking-detail">
                      <Clock className="booking-icon" />
                      <span>{booking.time}</span>
                    </div>
                    {booking.bookingType === 'class' && (
                      <div className="booking-detail">
                        <User className="booking-icon" />
                        <span>{booking.class.trainer}</span>
                      </div>
                    )}
                    {booking.bookingType === 'trainer' && (
                      <div className="booking-detail">
                        <Tag className="booking-icon" />
                        <span>{booking.sessionType}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="booking-actions">
                    <button
                      className="cancel-booking-btn"
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      <X className="cancel-icon" />
                      Cancel Booking
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
          
          {bookings.some(booking => booking.status === 'cancelled') && (
            <>
              <h3>Cancelled Bookings</h3>
              <div className="bookings-list cancelled">
                {bookings
                  .filter(booking => booking.status === 'cancelled')
                  .map(booking => (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="booking-card cancelled"
                    >
                      <div className="booking-type-badge cancelled">
                        Cancelled
                      </div>
                      
                      <h4 className="booking-title">
                        {booking.bookingType === 'class' 
                          ? booking.class.name 
                          : `Session with ${booking.trainer.name}`}
                      </h4>
                      
                      <div className="booking-details">
                        <div className="booking-detail">
                          <Calendar className="booking-icon" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="booking-detail">
                          <Clock className="booking-icon" />
                          <span>{booking.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingDashboard;
