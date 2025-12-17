import React, { useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Clock, X, RefreshCw, Database, Wifi, WifiOff } from 'lucide-react';
import AuthContext from '../contexts/AuthContext';
import { bookingService, membershipService } from '../services/api';
import '../styles/user-profile.css';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [bookings, setBookings] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const profileRef = useRef(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch bookings from database
  const fetchUserBookings = useCallback(async () => {
    if (!user) return [];

    try {
      console.log('Fetching bookings from database...');
      const response = await bookingService.getUserBookings({
        limit: 100,
        page: 1
      });

      if (response.success && response.data) {
        console.log('Database bookings fetched:', response.data.length);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching database bookings:', error);
      return [];
    }
  }, [user]);

  // Clean up invalid bookings utility
  const cleanupInvalidBookings = useCallback(() => {
    const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    
    const validBookings = localBookings.filter(booking => {
      // Check if booking has required fields
      const hasRequiredFields = booking.bookingType && booking.date && booking.time;
      
      if (!hasRequiredFields) {
        console.log('Removing invalid booking:', booking);
        return false;
      }

      // Additional validation for specific booking types
      if (booking.bookingType === 'class' && !booking.class) {
        console.log('Removing class booking without class data:', booking);
        return false;
      }

      if (booking.bookingType === 'trainer' && !booking.trainer) {
        console.log('Removing trainer booking without trainer data:', booking);
        return false;
      }

      return true;
    });

    if (validBookings.length !== localBookings.length) {
      console.log(`Cleaned up ${localBookings.length - validBookings.length} invalid bookings`);
      localStorage.setItem('userBookings', JSON.stringify(validBookings));
      setBookings(prevBookings => 
        prevBookings.filter(booking => 
          validBookings.some(valid => valid._id === booking._id)
        )
      );
    }
  }, []);

  // Debug function for development
  const debugBookings = useCallback(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    console.log('=== BOOKING DEBUG INFO ===');
    console.log('Total local bookings:', localBookings.length);
    
    localBookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`, {
        id: booking._id,
        type: booking.bookingType,
        date: booking.date,
        time: booking.time,
        hasClass: !!booking.class,
        hasTrainer: !!booking.trainer,
        valid: !!(booking.bookingType && booking.date && booking.time)
      });
    });
    
    const invalid = localBookings.filter(b => !b.bookingType || !b.date || !b.time);
    console.log('Invalid bookings:', invalid.length);
    invalid.forEach(booking => console.log('Invalid:', booking));
  }, []);

  // Sync local bookings with server
  const syncLocalBookings = useCallback(async () => {
    if (!user || !isOnline) return;

    setSyncing(true);
    try {
      const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      const unsynced = localBookings.filter(booking => 
        booking._id.startsWith('local-') || booking._id.startsWith('booking-')
      );

      console.log(`Found ${unsynced.length} unsynced bookings`);

      for (const booking of unsynced) {
        try {
          // Validate required fields before syncing
          if (!booking.bookingType || !booking.date || !booking.time) {
            console.error('Booking missing required fields:', booking);
            continue;
          }

          const bookingData = {
            bookingType: booking.bookingType,
            date: booking.date,
            time: booking.time,
            class: booking.class || null,
            trainer: booking.trainer || null,
            day: booking.day || null,
            participants: booking.participants || 1,
            sessionType: booking.sessionType || 'regular',
            userDetails: booking.userDetails || {},
            amount: booking.amount || 0,
            status: booking.status || 'pending'
          };

          // Additional validation for class bookings
          if (bookingData.bookingType === 'class' && !bookingData.class) {
            console.error('Class booking missing class data:', booking);
            continue;
          }

          // Additional validation for trainer bookings
          if (bookingData.bookingType === 'trainer' && !bookingData.trainer) {
            console.error('Trainer booking missing trainer data:', booking);
            continue;
          }

          console.log('Syncing booking:', booking._id, bookingData);
          const response = await bookingService.createBooking(bookingData);

          if (response.success) {
            console.log('Successfully synced booking:', booking._id);
            
            // Remove the local booking and update localStorage
            const updatedLocal = localBookings.filter(b => b._id !== booking._id);
            localStorage.setItem('userBookings', JSON.stringify(updatedLocal));
          }
        } catch (syncError) {
          console.error('Failed to sync individual booking:', booking._id, syncError.response?.data || syncError.message);
        }
      }

      // Refresh bookings after sync
      await fetchUserBookings();
      
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      setSyncing(false);
    }
  }, [user, isOnline, fetchUserBookings]);

  // Main data fetching function
  const fetchUserData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Clean up invalid bookings first
      cleanupInvalidBookings();

      // First sync any local bookings if online
      if (isOnline) {
        await syncLocalBookings();
      }

      // Fetch database bookings
      let databaseBookings = [];
      if (isOnline) {
        databaseBookings = await fetchUserBookings();
      }

      // Get local bookings as fallback
      const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      console.log('Local bookings:', localBookings.length);

      // Combine and deduplicate bookings
      const allBookings = [...databaseBookings];
      
      // Add local bookings that aren't in database
      localBookings.forEach(localBooking => {
        // Skip invalid bookings
        if (!localBooking.bookingType || !localBooking.date || !localBooking.time) {
          return;
        }

        const existsInDb = databaseBookings.some(dbBooking => 
          dbBooking._id === localBooking._id ||
          (dbBooking.date === localBooking.date && 
           dbBooking.time === localBooking.time &&
           dbBooking.bookingType === localBooking.bookingType)
        );
        
        if (!existsInDb) {
          allBookings.push(localBooking);
        }
      });

      // Sort by date (newest first)
      allBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setBookings(allBookings);
      console.log('Total bookings loaded:', allBookings.length);

      // Fetch subscription if online
      if (isOnline) {
        try {
          const subscriptionResponse = await membershipService.getUserSubscription();
          if (subscriptionResponse?.data?.subscription) {
            setSubscription(subscriptionResponse.data.subscription);
          } else {
            setSubscription(null);
          }
        } catch (subErr) {
          console.log('Error fetching subscription:', subErr);
          setSubscription(null);
        }
      }

    } catch (err) {
      setError('Failed to load user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isOnline, syncLocalBookings, fetchUserBookings, cleanupInvalidBookings]);

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Listen for new bookings from class schedule
  useEffect(() => {
    const handleBookingConfirmed = (event) => {
      console.log('New booking confirmed:', event.detail);
      const { booking } = event.detail;
      
      // Add the new booking to the current bookings list
      setBookings(prevBookings => {
        // Check if booking already exists
        const exists = prevBookings.some(b => b._id === booking._id);
        if (exists) {
          return prevBookings;
        }
        return [booking, ...prevBookings];
      });
      
      // Switch to bookings tab to show the new booking
      setActiveTab('bookings');
    };

    document.addEventListener('bookingConfirmed', handleBookingConfirmed);
    return () => {
      document.removeEventListener('bookingConfirmed', handleBookingConfirmed);
    };
  }, []);

  // Listen for subscription updates
  useEffect(() => {
    const handleSubscriptionUpdate = (event) => {
      console.log('Subscription update received:', event.detail);
      const { subscription: newSubscription } = event.detail;

      if (newSubscription) {
        setSubscription(newSubscription);
        setActiveTab('membership');
      }
    };

    document.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    document.addEventListener('userProfileSubscriptionUpdated', handleSubscriptionUpdate);

    return () => {
      document.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
      document.removeEventListener('userProfileSubscriptionUpdated', handleSubscriptionUpdate);
    };
  }, []);

  // Handle canceling a booking
  const handleCancelBooking = useCallback(async (bookingId) => {
    if (!bookingId) return;

    const confirmed = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirmed) return;

    try {
      // Try to cancel via API first if online
      if (isOnline) {
        try {
          const response = await bookingService.cancelBooking(bookingId);
          if (response.success) {
            console.log('Booking cancelled via API');
            
            // Update state immediately
            setBookings(prevBookings =>
              prevBookings.map(booking =>
                booking._id === bookingId
                  ? { ...booking, status: 'cancelled' }
                  : booking
              )
            );

            // Also update localStorage
            const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
            const updatedLocalBookings = localBookings.map(booking =>
              booking._id === bookingId
                ? { ...booking, status: 'cancelled' }
                : booking
            );
            localStorage.setItem('userBookings', JSON.stringify(updatedLocalBookings));

            alert('Booking cancelled successfully');
            return;
          }
        } catch (apiErr) {
          console.log('API cancel failed, handling locally:', apiErr);
        }
      }

      // Fallback to local cancellation
      const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      const updatedLocalBookings = localBookings.map(booking =>
        booking._id === bookingId
          ? { ...booking, status: 'cancelled' }
          : booking
      );
      localStorage.setItem('userBookings', JSON.stringify(updatedLocalBookings));

      // Update state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking._id === bookingId
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );

      alert('Booking cancelled (will sync when online)');

    } catch (err) {
      alert('Failed to cancel booking');
      console.error('Error canceling booking:', err);
    }
  }, [isOnline]);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  // Clear local bookings (development only)
  const clearLocalBookings = useCallback(() => {
    localStorage.removeItem('userBookings');
    setBookings(prevBookings => prevBookings.filter(booking => 
      !booking._id.startsWith('local-') && !booking._id.startsWith('booking-')
    ));
    console.log('Local bookings cleared');
  }, []);

  // Format date helper
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }, []);

  // Get booking source indicator
  const getBookingSource = useCallback((booking) => {
    if (booking._id.startsWith('local-') || booking._id.startsWith('booking-')) {
      return 'local';
    }
    return 'database';
  }, []);

  // Navigate to external membership section (FIXED)
  const navigateToMembershipPlans = useCallback(() => {
    // First close/hide the user profile
    const userProfileSection = document.getElementById('user-profile');
    if (userProfileSection) {
      userProfileSection.style.display = 'none';
    }
    
    // Then scroll to the main membership section
    setTimeout(() => {
      const membershipSection = document.getElementById('membership');
      if (membershipSection) {
        const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
        const offsetPosition = membershipSection.offsetTop - navbarHeight;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
      
      // Show the user profile again after scrolling
      setTimeout(() => {
        if (userProfileSection) {
          userProfileSection.style.display = 'block';
        }
      }, 1000);
    }, 100);
  }, []);

  // Navigate to classes section (FIXED)
  const navigateToClasses = useCallback(() => {
    const classesSection = document.getElementById('classes');
    if (classesSection) {
      const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
      const offsetPosition = classesSection.offsetTop - navbarHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // Memoized computed values
  const bookingCount = useMemo(() => bookings.length, [bookings]);
  const hasActiveSubscription = useMemo(() => !!subscription, [subscription]);

  if (!user) {
    return (
      <div className="user-profile-container">
        <p>Please log in to view your profile.</p>
        <a href="#login" className="login-link">Log In</a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <section id="user-profile" ref={profileRef} className="user-profile-section py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-8">
          <h2 className="user-profile-title text-3xl font-bold mr-4">My Account</h2>
          
          {/* Online/Offline indicator */}
          <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? <Wifi size={16} className="mr-1" /> : <WifiOff size={16} className="mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={loading || syncing}
            className="ml-3 p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          </button>
        </div>

        {error && (
          <div className="user-profile-error bg-red-100 text-red-700 p-4 rounded-md mb-6 text-center">
            {error}
            <button onClick={handleRefresh} className="ml-2 underline">
              Try Again
            </button>
          </div>
        )}

        {syncing && (
          <div className="bg-blue-100 text-blue-700 p-4 rounded-md mb-6 text-center">
            <RefreshCw size={16} className="inline animate-spin mr-2" />
            Syncing your bookings...
          </div>
        )}

        {/* Tabs */}
        <div className="user-profile-tabs flex justify-center mb-8">
          <button
            className={`user-profile-tab px-6 py-2 mx-2 rounded-md font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`user-profile-tab px-6 py-2 mx-2 rounded-md font-medium transition-colors ${
              activeTab === 'bookings' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings
            {bookingCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                {bookingCount}
              </span>
            )}
          </button>
          <button
            className={`user-profile-tab px-6 py-2 mx-2 rounded-md font-medium transition-colors ${
              activeTab === 'membership' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('membership')}
          >
            Membership
            {hasActiveSubscription && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        <div className="user-profile-content max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="user-profile-info text-center"
            >
              <div className="user-avatar mx-auto bg-primary-100 dark:bg-primary-900/30 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-4">
                <User size={48} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="user-name text-2xl font-semibold mb-6">{user.name}</h3>
              
              <div className="user-details max-w-md mx-auto mb-8">
                <div className="user-detail flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="user-detail-label font-medium">Email:</span>
                  <span className="user-detail-value text-gray-600 dark:text-gray-300">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="user-detail flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="user-detail-label font-medium">Phone:</span>
                    <span className="user-detail-value text-gray-600 dark:text-gray-300">{user.phone}</span>
                  </div>
                )}
                <div className="user-detail flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="user-detail-label font-medium">Member Since:</span>
                  <span className="user-detail-value text-gray-600 dark:text-gray-300">
                    {formatDate(user.createdAt) || 'N/A'}
                  </span>
                </div>
                <div className="user-detail flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="user-detail-label font-medium">Total Bookings:</span>
                  <span className="user-detail-value text-primary-600 dark:text-primary-400 font-medium">
                    {bookingCount}
                  </span>
                </div>
              </div>

              <div className="user-actions flex justify-center space-x-4">
                <button className="user-action-button px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors">
                  Edit Profile
                </button>
                <button className="user-action-button px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Change Password
                </button>
              </div>
            </motion.div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="user-bookings"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="user-section-title text-xl font-semibold">My Bookings</h3>
                
                {/* Development controls */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={clearLocalBookings}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                    >
                      Clear Local
                    </button>
                    <button 
                      onClick={syncLocalBookings}
                      disabled={syncing || !isOnline}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors disabled:opacity-50"
                    >
                      {syncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                    <button 
                      onClick={debugBookings}
                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                    >
                      Debug
                    </button>
                  </div>
                )}
              </div>

              {bookingCount === 0 ? (
                <div className="no-bookings-message text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any bookings yet.</p>
                  <button 
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
                    onClick={navigateToClasses}
                  >
                    Book a Class
                  </button>
                </div>
              ) : (
                <div className="bookings-list space-y-4">
                  {bookings.map(booking => (
                    <div
                      key={booking._id}
                      className={`booking-card p-4 border rounded-lg relative ${
                        booking.status === 'pending' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10' :
                        booking.status === 'confirmed' ? 'border-green-300 bg-green-50 dark:bg-green-900/10' :
                        booking.status === 'cancelled' ? 'border-red-300 bg-red-50 dark:bg-red-900/10' :
                        'border-gray-300 bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      {/* Booking source indicator */}
                      <div className="absolute top-2 right-2">
                        {getBookingSource(booking) === 'local' ? (
                          <div className="flex items-center text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                            <WifiOff size={12} className="mr-1" />
                            Local
                          </div>
                        ) : (
                          <div className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            <Database size={12} className="mr-1" />
                            Synced
                          </div>
                        )}
                      </div>

                      <div className="booking-header flex justify-between items-center mb-3 pr-16">
                        <h4 className="booking-title font-medium">
                          {booking.bookingType === 'class'
                            ? booking.class?.name || 'Class Booking'
                            : `Session with ${booking.trainer?.name || 'Trainer'}`}
                        </h4>
                        <span className={`booking-status px-2 py-1 text-xs rounded-full ${
                          booking.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                          booking.status === 'confirmed' ? 'bg-green-200 text-green-800' :
                          booking.status === 'cancelled' ? 'bg-red-200 text-red-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                        </span>
                      </div>

                      <div className="booking-details grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        <div className="booking-detail flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">
                            {booking.day ? `${booking.day}, ${formatDate(booking.date)}` : formatDate(booking.date)}
                          </span>
                        </div>

                        {booking.time && (
                          <div className="booking-detail flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm">{booking.time}</span>
                          </div>
                        )}

                        {booking.bookingType === 'class' && booking.class?.type && (
                          <div className="booking-detail flex items-center">
                            <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                              {booking.class.type}
                            </span>
                          </div>
                        )}

                        {booking.bookingType === 'class' && booking.class?.trainer && (
                          <div className="booking-detail flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm">Trainer: {booking.class.trainer}</span>
                          </div>
                        )}

                        <div className="booking-detail flex items-center">
                          <span className="text-sm">
                            {booking.participants || 1} {(booking.participants || 1) > 1 ? 'participants' : 'participant'}
                          </span>
                        </div>
                      </div>

                      {/* Additional details for class bookings */}
                      {booking.bookingType === 'class' && (
                        <div className="class-booking-extras mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          {booking.class?.difficulty && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Difficulty: <span className="font-medium">{booking.class.difficulty}</span>
                            </div>
                          )}
                          {booking.class?.duration && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Duration: <span className="font-medium">{booking.class.duration} minutes</span>
                            </div>
                          )}
                          {booking.userDetails?.notes && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                          Notes: <span className="italic">{booking.userDetails.notes}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Additional details for trainer bookings */}
                      {booking.bookingType === 'trainer' && (
                        <div className="trainer-booking-extras mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          {booking.sessionType && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Session Type: <span className="font-medium">{booking.sessionType}</span>
                            </div>
                          )}
                          {booking.trainer?.specialization && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Specialization: <span className="font-medium">{booking.trainer.specialization}</span>
                            </div>
                          )}
                          {booking.userDetails?.goals && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Goals: <span className="italic">{booking.userDetails.goals}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Booking actions */}
                      {booking.status !== 'cancelled' && (
                        <div className="booking-actions flex justify-end">
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="cancel-booking-button px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      )}

                      {/* Booking ID for debugging */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="booking-debug mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                          <span className="text-xs text-gray-400">ID: {booking._id}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Membership Tab */}
          {activeTab === 'membership' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="user-membership"
            >
              <h3 className="user-section-title text-xl font-semibold mb-6 text-center">My Membership</h3>

              {subscription ? (
                <div className="membership-details">
                  <div className="membership-plan-card border border-green-300 rounded-lg p-6 bg-green-50 dark:bg-green-900/10 dark:border-green-700">
                    <div className="membership-header flex justify-between items-center mb-4">
                      <h4 className="membership-plan-name text-xl font-semibold text-green-700 dark:text-green-300">
                        {subscription.plan?.name || 'Premium'} Plan
                      </h4>
                      <span className="membership-status px-3 py-1 bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                        {subscription.status || 'Active'}
                      </span>
                    </div>

                    <div className="membership-plan-price text-center text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                      ₹{subscription.plan?.price || subscription.amount}/{subscription.plan?.period || 'month'}
                    </div>

                    <div className="membership-details-grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="membership-detail">
                        <span className="detail-label font-medium text-gray-700 dark:text-gray-300">Start Date:</span>
                        <span className="detail-value ml-2 text-gray-900 dark:text-white">
                          {formatDate(subscription.startDate)}
                        </span>
                      </div>

                      <div className="membership-detail">
                        <span className="detail-label font-medium text-gray-700 dark:text-gray-300">End Date:</span>
                        <span className="detail-value ml-2 text-gray-900 dark:text-white">
                          {formatDate(subscription.endDate)}
                        </span>
                      </div>

                      <div className="membership-detail">
                        <span className="detail-label font-medium text-gray-700 dark:text-gray-300">Payment Status:</span>
                        <span className={`detail-value ml-2 font-medium ${
                          subscription.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {subscription.paymentStatus?.charAt(0).toUpperCase() + subscription.paymentStatus?.slice(1)}
                        </span>
                      </div>

                      <div className="membership-detail">
                        <span className="detail-label font-medium text-gray-700 dark:text-gray-300">Auto Renewal:</span>
                        <span className="detail-value ml-2 text-gray-900 dark:text-white">
                          {subscription.autoRenewal ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {subscription.plan?.features && (
                      <div className="membership-features mb-6">
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Plan Features:</h5>
                        <ul className="feature-list text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {subscription.plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="membership-actions flex flex-wrap gap-3 justify-center">
                      <button 
                        className="membership-action-button px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
                        onClick={navigateToMembershipPlans}
                      >
                        Upgrade Plan
                      </button>
                      <button className="membership-action-button px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Manage Subscription
                      </button>
                      <button className="membership-action-button px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        View Billing History
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-membership-message text-center py-8">
                  <div className="membership-icon mx-auto bg-gray-100 dark:bg-gray-800 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-4">
                    <User size={48} className="text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium mb-2">No Active Membership</h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Subscribe to a membership plan to get exclusive benefits and discounts.
                  </p>
                  <button
                    className="membership-subscribe-button px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
                    onClick={navigateToMembershipPlans}
                  >
                    View Membership Plans
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(UserProfile);
