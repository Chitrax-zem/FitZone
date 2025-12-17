// contexts/BookingContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { bookingService } from '../services/api';
import AuthContext from './AuthContext';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's bookings when user changes
  useEffect(() => {
    if (user) {
      fetchUserBookings();
    } else {
      setBookings([]);
    }
  }, [user]);

  // Listen for booking events
  useEffect(() => {
    const handleBookingConfirmed = (event) => {
      const { booking } = event.detail;
      if (booking) {
        setBookings(prev => [booking, ...prev]);
      }
    };

    document.addEventListener('bookingConfirmed', handleBookingConfirmed);
    
    return () => {
      document.removeEventListener('bookingConfirmed', handleBookingConfirmed);
    };
  }, []);

  // Fetch user's bookings
  const fetchUserBookings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingService.getUserBookings();
      
      if (response.success) {
        setBookings(response.data);
      } else {
        setError(response.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
      
      // Try to get bookings from localStorage as fallback
      const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      if (localBookings.length > 0) {
        setBookings(localBookings);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create a new booking
  const createBooking = async (bookingData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingService.createBooking(bookingData);
      
      if (response.success) {
        // Add to state
        setBookings(prev => [response.data, ...prev]);
        
        // Also save to localStorage as backup
        const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        localBookings.unshift(response.data);
        localStorage.setItem('userBookings', JSON.stringify(localBookings));
        
        return response.data;
      } else {
        setError(response.message || 'Failed to create booking');
        throw new Error(response.message || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel a booking
  const cancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingService.cancelBooking(bookingId);
      
      if (response.success) {
        // Update state
        setBookings(prev => 
          prev.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status: 'cancelled' } 
              : booking
          )
        );
        
        // Update localStorage
        const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const updatedLocalBookings = localBookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        );
        localStorage.setItem('userBookings', JSON.stringify(updatedLocalBookings));
        
        return response.data;
      } else {
        setError(response.message || 'Failed to cancel booking');
        throw new Error(response.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.message || 'Failed to cancel booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      loading,
      error,
      fetchUserBookings,
      createBooking,
      cancelBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export default BookingContext;
