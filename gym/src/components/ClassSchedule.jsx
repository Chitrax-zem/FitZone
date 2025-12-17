import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Clock, User, BarChart3, Filter, X, Calendar, Clock as ClockIcon, Users } from 'lucide-react';
// Import the dedicated CSS file
import '../styles/class-schedule.css';
import AuthContext from '../contexts/AuthContext';
import { bookingService } from '../services/api';

const ClassSchedule = () => {
  const { user } = useContext(AuthContext); // Get user from AuthContext
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedFilter, setSelectedFilter] = useState('All');
  
  // State for booking modal
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    participants: 1,
    notes: ''
  });

  // State to track pending booking (for after login)
  const [pendingBooking, setPendingBooking] = useState(null);
  // Add loading state
  const [bookingLoading, setBookingLoading] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const classTypes = ['All', 'Yoga', 'Cardio', 'Strength', 'HIIT', 'Dance'];

  const schedule = {
    Monday: [
      { time: '06:00', name: 'Morning Yoga', trainer: 'Emily Chen', type: 'Yoga', difficulty: 'Beginner', duration: 60, spots: 15 },
      { time: '08:00', name: 'HIIT Bootcamp', trainer: 'Mike Rodriguez', type: 'HIIT', difficulty: 'Advanced', duration: 45, spots: 12 },
      { time: '10:00', name: 'Strength Training', trainer: 'Sarah Johnson', type: 'Strength', difficulty: 'Intermediate', duration: 60, spots: 10 },
      { time: '18:00', name: 'Evening Flow', trainer: 'Emily Chen', type: 'Yoga', difficulty: 'All Levels', duration: 75, spots: 20 },
      { time: '19:30', name: 'Cardio Blast', trainer: 'Mike Rodriguez', type: 'Cardio', difficulty: 'Intermediate', duration: 45, spots: 4 }
    ],
    Tuesday: [
      { time: '07:00', name: 'Power Lifting', trainer: 'David Thompson', type: 'Strength', difficulty: 'Advanced', duration: 90, spots: 8 },
      { time: '09:00', name: 'Zumba Dance', trainer: 'Maria Garcia', type: 'Dance', difficulty: 'All Levels', duration: 60, spots: 25 },
      { time: '12:00', name: 'Lunch Break Cardio', trainer: 'Mike Rodriguez', type: 'Cardio', difficulty: 'Beginner', duration: 30, spots: 15 },
      { time: '17:00', name: 'Vinyasa Yoga', trainer: 'Emily Chen', type: 'Yoga', difficulty: 'Intermediate', duration: 60, spots: 18 },
      { time: '19:00', name: 'CrossFit', trainer: 'Sarah Johnson', type: 'HIIT', difficulty: 'Advanced', duration: 60, spots: 0 }
    ],
    Wednesday: [
      { time: '06:30', name: 'Sunrise Stretch', trainer: 'Emily Chen', type: 'Yoga', difficulty: 'All Levels', duration: 45, spots: 20 },
      { time: '08:30', name: 'Strength Circuit', trainer: 'Sarah Johnson', type: 'Strength', difficulty: 'Intermediate', duration: 50, spots: 14 },
      { time: '11:00', name: 'Aqua Fitness', trainer: 'Lisa Park', type: 'Cardio', difficulty: 'All Levels', duration: 45, spots: 16 },
      { time: '18:30', name: 'HIIT Express', trainer: 'Mike Rodriguez', type: 'HIIT', difficulty: 'Intermediate', duration: 30, spots: 15 },
      { time: '20:00', name: 'Restorative Yoga', trainer: 'Emily Chen', type: 'Yoga', difficulty: 'Beginner', duration: 60, spots: 22 }
    ],
    Thursday: [
      { time: '07:00', name: 'Morning Cardio', trainer: 'Mike Rodriguez', type: 'Cardio', difficulty: 'Intermediate', duration: 45, spots: 18 },
      { time: '09:30', name: 'Pilates', trainer: 'Lisa Park', type: 'Yoga', difficulty: 'All Levels', duration: 60, spots: 15 },
      { time: '12:15', name: 'Express Strength', trainer: 'David Thompson', type: 'Strength', difficulty: 'Beginner', duration: 30, spots: 12 },
      { time: '17:30', name: 'Boxing Fitness', trainer: 'Mike Rodriguez', type: 'HIIT', difficulty: 'Advanced', duration: 60, spots: 10 },
      { time: '19:00', name: 'Hip Hop Dance', trainer: 'Maria Garcia', type: 'Dance', difficulty: 'Intermediate', duration: 60, spots: 20 }
    ],
    Friday: [
      { time: '06:00', name: 'Power Yoga', trainer: 'Emily Chen', type: 'Yoga', difficulty: 'Intermediate', duration: 60, spots: 15 },
      { time: '08:00', name: 'Tabata', trainer: 'Mike Rodriguez', type: 'HIIT', difficulty: 'Advanced', duration: 45, spots: 12 },
      { time: '10:30', name: 'Senior Fitness', trainer: 'Sarah Johnson', type: 'Cardio', difficulty: 'Beginner', duration: 45, spots: 20 },
      { time: '17:00', name: 'TRX Training', trainer: 'David Thompson', type: 'Strength', difficulty: 'Intermediate', duration: 45, spots: 8 },
      { time: '19:00', name: 'Friday Dance Party', trainer: 'Maria Garcia', type: 'Dance', difficulty: 'All Levels', duration: 75, spots: 30 }
    ],
    Saturday: [
      { time: '08:00', name: 'Weekend Warrior', trainer: 'David Thompson', type: 'HIIT', difficulty: 'Advanced', duration: 60, spots: 15 },
      { time: '10:00', name: 'Yoga Flow', trainer: 'Emily Chen', type: 'Yoga', difficulty: 'All Levels', duration: 75, spots: 25 },
      { time: '12:00', name: 'Strength & Conditioning', trainer: 'Sarah Johnson', type: 'Strength', difficulty: 'Intermediate', duration: 60, spots: 12 },
      { time: '14:00', name: 'Zumba', trainer: 'Maria Garcia', type: 'Dance', difficulty: 'All Levels', duration: 60, spots: 30 },
      { time: '16:00', name: 'Core Blast', trainer: 'Mike Rodriguez', type: 'Strength', difficulty: 'Intermediate', duration: 45, spots: 20 }
    ]
  };

  // Functions now return simple, readable class names
  const getClassTypeCss = (type) => `type-${type.toLowerCase()}`;
  const getDifficultyCss = (difficulty) => `difficulty-${difficulty.toLowerCase().replace(' ', '-')}`;

  const filteredClasses = schedule[selectedDay]?.filter(classItem => 
    selectedFilter === 'All' || classItem.type === selectedFilter
  ) || [];

  // Function to trigger auth modal from other components
  const openAuthModal = (view = 'login') => {
    const event = new CustomEvent('openAuthModal', {
      detail: { view }
    });
    document.dispatchEvent(event);
  };

  // Listen for successful login to process pending booking
  useEffect(() => {
    const handleLoginSuccess = () => {
      // If there's a pending booking and user is now logged in, process it
      if (pendingBooking && user) {
        console.log('User logged in, processing pending booking:', pendingBooking);
        handleBookClass(pendingBooking);
        setPendingBooking(null); // Clear pending booking
      }
    };

    // Listen for login success events
    document.addEventListener('loginSuccess', handleLoginSuccess);
    
    // Also check when user state changes
    if (pendingBooking && user) {
      handleLoginSuccess();
    }

    return () => {
      document.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, [user, pendingBooking]);
  
  // Helper function to get the next occurrence of a specific day
  const getNextDateForDay = (dayName) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const targetDay = days.indexOf(dayName);
    const todayDay = today.getDay();
    
    let daysUntilTarget = targetDay - todayDay;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7; // Next week
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate.toISOString();
  };

  // Updated handle booking function to check authentication
  const handleBookClass = async (classItem) => {
    if (!user) {
      alert('Please log in to book a class');
      // Store pending booking for after login
      setPendingBooking(classItem);
      openAuthModal('login');
      return;
    }

    try {
      setBookingLoading(true);

      // Get the next date for the selected day
      const classDate = getNextDateForDay(selectedDay);
      
      // Prepare booking data for API
      const bookingData = {
        bookingType: 'class',
        class: {
          name: classItem.name,
          type: classItem.type,
          trainer: classItem.trainer,
          difficulty: classItem.difficulty,
          duration: classItem.duration,
          maxParticipants: classItem.spots + (classItem.currentParticipants || 0)
        },
        date: classDate,
        time: classItem.time,
        day: selectedDay,
        participants: 1,
        sessionType: 'class',
        userDetails: {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          notes: ''
        },
        amount: classItem.price || 0
      };

      console.log('Booking class with data:', bookingData);

      // Save to database via API
      const response = await bookingService.createBooking(bookingData);
      
      if (response.success) {
        console.log('Booking saved to database:', response.data);

        // Also save to localStorage as backup
        const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const bookingWithId = {
          ...response.data,
          _id: response.data._id || `booking-${Date.now()}`,
          bookedAt: new Date().toISOString()
        };
        
        localBookings.unshift(bookingWithId);
        localStorage.setItem('userBookings', JSON.stringify(localBookings));

        // Dispatch event to update UserProfile
        const bookingEvent = new CustomEvent('bookingConfirmed', {
          detail: { booking: bookingWithId }
        });
        document.dispatchEvent(bookingEvent);

        // Show success message
        alert(`Successfully booked ${classItem.name} for ${selectedDay} at ${classItem.time}!`);
        
        // Scroll to user profile
        setTimeout(() => {
          const profileEvent = new CustomEvent('showUserProfile');
          document.dispatchEvent(profileEvent);
        }, 1000);
      } else {
        throw new Error(response.message || 'Failed to create booking');
      }

    } catch (error) {
      console.error('Error booking class:', error);
      
      // Fallback to localStorage if API fails
      console.log('API booking failed, saving to localStorage as fallback');
      
      const fallbackBooking = {
        _id: `local-${Date.now()}`,
        bookingType: 'class',
        class: {
          name: classItem.name,
          type: classItem.type,
          trainer: classItem.trainer,
          difficulty: classItem.difficulty,
          duration: classItem.duration
        },
        date: getNextDateForDay(selectedDay),
        time: classItem.time,
        day: selectedDay,
        status: 'confirmed',
        participants: 1,
        userDetails: {
          name: user.name,
          email: user.email,
          notes: 'Booked offline - sync pending'
        },
        bookedAt: new Date().toISOString()
      };

      const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      localBookings.unshift(fallbackBooking);
      localStorage.setItem('userBookings', JSON.stringify(localBookings));

      // Dispatch event anyway
      const bookingEvent = new CustomEvent('bookingConfirmed', {
        detail: { booking: fallbackBooking }
      });
      document.dispatchEvent(bookingEvent);

      alert(`Booking saved locally. ${error.response?.data?.message || error.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
    
    // Reset booking data
    setBookingData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      participants: 1,
      notes: ''
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create booking object with all necessary details
    const newBooking = {
      _id: Date.now().toString(), // Temporary ID for local storage
      bookingType: 'class',
      class: {
        name: selectedClass.name,
        trainer: selectedClass.trainer,
        type: selectedClass.type,
        difficulty: selectedClass.difficulty,
        duration: selectedClass.duration
      },
      day: selectedDay,
      date: getNextDateForDay(selectedDay),
      time: selectedClass.time,
      status: 'confirmed',
      participants: bookingData.participants,
      userDetails: {
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        notes: bookingData.notes
      },
      bookedAt: new Date().toISOString()
    };

    // Save to localStorage (or send to backend)
    const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const updatedBookings = [...existingBookings, newBooking];
    localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
    
    console.log('Booking submitted:', newBooking);
    
    // Close the modal after submission
    handleCloseModal();
    
    // Show success message
    alert(`Thank you for booking ${selectedClass.name}! We'll see you on ${selectedDay} at ${selectedClass.time}.`);
    
    // Dispatch event to update bookings in UserProfile
    document.dispatchEvent(new CustomEvent('bookingConfirmed', {
      detail: {
        booking: newBooking
      }
    }));
  };

  // Function to open booking modal
  const openBookingModal = (classItem) => {
    if (!user) {
      alert('Please log in to book a class');
      setPendingBooking(classItem);
      openAuthModal('login');
      return;
    }
    
    setSelectedClass(classItem);
    setBookingData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      participants: 1,
      notes: ''
    });
    setShowModal(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  return (
    <section id="classes" className="schedule-section section-padding">
      <div className="schedule-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="schedule-header"
          ref={ref}
        >
          <h2 className="section-top-title">
            Class <span className="section-top-title-highlight">Schedule</span>
          </h2>
          <p className="section-subtitle">
            Join our diverse range of fitness classes led by expert instructors. 
            Find the perfect class for your fitness level and goals.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="schedule-filters"
        >
          {/* Day Filter */}
          <div className="filter-section">
            <div className="filter-header">
              <Filter className="filter-icon" />
              <h3 className="filter-title">Select Day</h3>
            </div>
            <div className="filter-buttons">
              {days.map((day) => (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDay(day)}
                  className={`filter-button ${selectedDay === day ? 'active' : ''}`}
                >
                  {day}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Class Type Filter */}
          <div className="filter-section">
            <h3 className="filter-title mb-4">Filter by Class Type</h3>
            <div className="filter-buttons">
              {classTypes.map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFilter(type)}
                  className={`filter-button ${selectedFilter === type ? 'active' : ''}`}
                >
                  {type}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Schedule Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="schedule-grid"
        >
          {filteredClasses.length > 0 ? (
            filteredClasses.map((classItem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="class-card card p-6 flex flex-col md:flex-row items-start md:items-center justify-between"
              >
                <div className="flex-1">
                  <div className="class-header flex items-center mb-2">
                    <Clock className="class-time-icon h-5 w-5 mr-2" />
                    <span className="class-time text-2xl font-bold">{classItem.time}</span>
                    <span className={`class-type-badge ml-4 ${getClassTypeCss(classItem.type)}`}>
                      {classItem.type}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{classItem.name}</h3>
                  
                  <div className="class-details flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{classItem.trainer}</span>
                    </div>
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      <span className={getDifficultyCss(classItem.difficulty)}>
                        {classItem.difficulty}
                      </span>
                    </div>
                    <span>{classItem.duration} min</span>
                    <span className={classItem.spots < 5 ? 'spots-limited' : 'spots-available'}>
                      {classItem.spots} spots left
                    </span>
                  </div>
                </div>

                <div className="class-action mt-4 md:mt-0 md:ml-6">
                  <button
                    className={`class-button ${
                      classItem.spots > 0
                        ? 'class-button-available'
                        : 'class-button-full'
                    }`}
                    disabled={classItem.spots === 0 || bookingLoading}
                    onClick={() => classItem.spots > 0 && openBookingModal(classItem)}
                    title={!user ? 'Login required to book classes' : ''}
                  >
                    {bookingLoading ? 'Booking...' : (
                      classItem.spots > 0 ? (
                        user ? 'Book Now' : 'Login to Book'
                      ) : 'Full'
                    )}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="schedule-empty">
              <p className="text-lg">
                No classes available for {selectedDay} with the selected filter.
              </p>
            </div>
          )}
        </motion.div>

        {/* Show pending booking message */}
        {pendingBooking && !user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pending-booking-message bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4"
          >
            <p className="text-blue-800 dark:text-blue-200">
              <strong>Ready to book:</strong> {pendingBooking.name} on {selectedDay} at {pendingBooking.time}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              Please log in to complete your booking.
            </p>
          </motion.div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && selectedClass && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="booking-modal-overlay"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="booking-modal-container"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <div className="booking-modal-header">
                <h3 className="booking-modal-title">Book Class: {selectedClass.name}</h3>
                <button 
                  className="booking-modal-close"
                  onClick={handleCloseModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="booking-modal-body">
                  {/* Class Summary */}
                  <div className="booking-class-summary">
                    <div className={`booking-class-type ${getClassTypeCss(selectedClass.type)}`}>
                      {selectedClass.type}
                    </div>
                    <div className="booking-class-details">
                      <div className="booking-class-info">
                        <div className="booking-info-item">
                          <Calendar className="booking-info-icon" />
                          <span>{selectedDay}</span>
                        </div>
                        <div className="booking-info-item">
                          <ClockIcon className="booking-info-icon" />
                          <span>{selectedClass.time} ({selectedClass.duration} min)</span>
                        </div>
                        <div className="booking-info-item">
                          <User className="booking-info-icon" />
                          <span>Instructor: {selectedClass.trainer}</span>
                        </div>
                        <div className="booking-info-item">
                          <Users className="booking-info-icon" />
                          <span>{selectedClass.spots} spots available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Form Fields */}
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={bookingData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={bookingData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={bookingData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="participants" className="form-label">Number of Participants</label>
                    <input
                      type="number"
                      id="participants"
                      name="participants"
                      value={bookingData.participants}
                      onChange={handleInputChange}
                      min="1"
                      max={selectedClass.spots}
                      className="form-input"
                      required
                    />
                    <small className="form-helper-text">
                      Maximum {selectedClass.spots} participants
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="notes" className="form-label">Additional Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={bookingData.notes}
                      onChange={handleInputChange}
                      className="form-textarea"
                      rows="3"
                      placeholder="Any special requirements or information..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="booking-modal-footer">
                  <button 
                    type="button" 
                    className="booking-modal-btn booking-modal-btn-cancel"
                    onClick={handleCloseModal}
                    disabled={bookingLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="booking-modal-btn booking-modal-btn-submit"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ClassSchedule;
