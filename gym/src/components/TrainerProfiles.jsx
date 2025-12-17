import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Award, Clock, Users, X, Calendar, Clock as ClockIcon } from 'lucide-react';
import '../styles/trainer-profiles.css';
import { trainerService, bookingService, authService } from '../services/api';
import AuthContext from '../contexts/AuthContext';

// Fallback data for when API fails (kept for local UI fallback)
const FALLBACK_TRAINERS = [
  {
    name: 'Sarah Johnson',
    specialization: 'Strength Training & Powerlifting',
    experience: 8,
    image: 'https://i.pinimg.com/736x/6a/a7/6c/6aa76cca9f2a4ce7458902851b89e1b0.jpg',
    bio: 'Former Olympic weightlifter with expertise in strength training and powerlifting. Helped 200+ clients achieve their strength goals.',
    certifications: ['NASM-CPT', 'CSCS', 'Olympic Lifting'],
    stats: { clients: 200, years: 8, rating: 4.9 },
    hourlyRate: 85
  },
  {
    name: 'Mike Rodriguez',
    specialization: 'HIIT & Cardio Training',
    experience: 6,
    image: 'https://i.pinimg.com/1200x/88/d1/1a/88d11a3428462b2e143d8c4a28af7a60.jpg',
    bio: 'High-energy trainer specializing in HIIT workouts and cardiovascular conditioning. Marathon runner and fitness enthusiast.',
    certifications: ['ACE-CPT', 'HIIT Specialist', 'Running Coach'],
    stats: { clients: 150, years: 6, rating: 4.8 },
    hourlyRate: 75
  },
  {
    name: 'Emily Chen',
    specialization: 'Yoga & Flexibility',
    experience: 10,
    image: 'https://i.pinimg.com/1200x/a5/48/6e/a5486e5ceec98dc2eb463c447ff86994.jpg',
    bio: 'Certified yoga instructor with a focus on flexibility, mindfulness, and holistic wellness. Trained in multiple yoga disciplines.',
    certifications: ['RYT-500', 'Yin Yoga', 'Meditation'],
    stats: { clients: 300, years: 10, rating: 5.0 },
    hourlyRate: 70
  },
  {
    name: 'Rose Yougt',
    specialization: 'Bodybuilding & Nutrition',
    experience: 12,
    image: 'https://i.pinimg.com/1200x/2d/5d/1f/2d5d1ff0cafd1dff0a8d3e6b09c5af73.jpg',
    bio: 'Professional bodybuilder and nutrition expert. Specializes in muscle building, cutting, and competition preparation.',
    certifications: ['IFBB Pro', 'Nutrition Specialist', 'Contest Prep'],
    stats: { clients: 180, years: 12, rating: 4.9 },
    hourlyRate: 95
  }
];

// Animation variants - defined outside component to prevent recreation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

// Normalize trainers from different sources/shapes into a uniform structure
function normalizeTrainers(list) {
  return (list || []).map((t, idx) => {
    const specialization =
      Array.isArray(t.specialization) ? t.specialization.join(', ') : (t.specialization || '');

    const clients = t.stats?.clients ?? t.clients ?? t.reviewCount ?? 0;
    const years = t.stats?.years ?? t.years ?? t.experience ?? 0;
    const rating = t.stats?.rating ?? t.rating ?? 0;

    return {
      ...t,
      _id: t._id || `trainer-${idx}-${(t.name || 'unknown').replace(/\s+/g, '-').toLowerCase()}`,
      specialization,
      stats: { clients, years, rating },
      certifications: Array.isArray(t.certifications) ? t.certifications : [],
      image: t.image || '/images/trainers/default.jpg',
      hourlyRate: t.hourlyRate ?? 0
    };
  });
}

const TrainerProfiles = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const { user } = useContext(AuthContext);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // State for booking modal
  const [showModal, setShowModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    sessionType: 'personal',
    message: ''
  });

  // Prevent duplicate fetches in StrictMode
  const didFetchTrainersRef = useRef(false);

  // Today's date for min attribute
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Fetch trainers (once)
  useEffect(() => {
    if (didFetchTrainersRef.current) return;
    didFetchTrainersRef.current = true;

    const fetchTrainers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await trainerService.getAllTrainers();

        if (response?.data?.length > 0) {
          setTrainers(normalizeTrainers(response.data));
        } else {
          console.log('No trainers data received, using fallback data');
          setTrainers(normalizeTrainers(FALLBACK_TRAINERS));
        }
      } catch (err) {
        console.error('Error fetching trainers:', err);
        setError('Failed to load trainers');
        setTrainers(normalizeTrainers(FALLBACK_TRAINERS));
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  // Open booking modal
  const handleBookSession = useCallback(
    (trainer) => {
      if (!user) {
        openAuthModal('login');
        return;
      }

      setSelectedTrainer(trainer);
      setShowModal(true);
      setBookingSuccess(false);
      document.body.style.overflow = 'hidden';

      setBookingData({
        date: '',
        time: '',
        sessionType: 'personal',
        message: ''
      });
    },
    [user]
  );

  // Close modal
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    document.body.style.overflow = 'auto';

    setTimeout(() => {
      setBookingSuccess(false);
    }, 300);
  }, []);

  // Form changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const openAuthModal = (view = 'login') => {
    const event = new CustomEvent('openAuthModal', { detail: { view } });
    document.dispatchEvent(event);
  };

  // Token validation and refresh
  const checkTokenValid = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  };

  const refreshTokenIfNeeded = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      if (checkTokenValid()) return true;
      console.log('Token invalid, attempting to refresh...');
      await authService.refreshToken();
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  };

  // Sync pending local bookings when user is available
  const syncPendingBookings = async () => {
    try {
      const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      const pendingBookings = localBookings.filter((b) => b.status === 'pending-sync' || b.isLocal);
      if (pendingBookings.length === 0) return;

      console.log(`Attempting to sync ${pendingBookings.length} pending bookings...`);

      for (const booking of pendingBookings) {
        try {
          const { isLocal, _id, ...payload } = booking;
          await bookingService.createBooking(payload);

          const updated = localBookings.map((b) =>
            b._id === booking._id ? { ...b, status: 'confirmed', isLocal: false } : b
          );
          localStorage.setItem('userBookings', JSON.stringify(updated));
          console.log(`Successfully synced booking: ${booking._id}`);
        } catch (error) {
          console.error(`Failed to sync booking ${booking._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error syncing pending bookings:', error);
    }
  };

  useEffect(() => {
    if (user) {
      syncPendingBookings();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please log in to book a session');
      handleCloseModal();
      openAuthModal('login');
      return;
    }

    if (!bookingData.date || !bookingData.time) {
      alert('Please select a date and time for your session');
      return;
    }

    try {
      setSubmitting(true);

      const trainerBookingData = {
        bookingType: 'trainer',
        trainer: {
          name: selectedTrainer.name,
          specialization: selectedTrainer.specialization,
          _id: selectedTrainer._id || `trainer-${selectedTrainer.name}`
        },
        date: bookingData.date,
        time: bookingData.time,
        day: getDayFromDate(bookingData.date),
        participants: 1,
        sessionType: bookingData.sessionType,
        userDetails: {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          notes: bookingData.message
        },
        amount: selectedTrainer.hourlyRate || 0
      };

      await refreshTokenIfNeeded();

      let response;
      let savedLocally = false;

      try {
        response = await bookingService.createBooking(trainerBookingData);
      } catch (apiError) {
        console.error('API Error when creating booking:', apiError);

        const localBooking = {
          ...trainerBookingData,
          _id: `local-${Date.now()}`,
          status: 'pending-sync',
          createdAt: new Date().toISOString(),
          isLocal: true
        };

        const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        localBookings.push(localBooking);
        localStorage.setItem('userBookings', JSON.stringify(localBookings));

        savedLocally = true;
        response = {
          data: localBooking,
          success: true,
          message: 'Booking saved locally and will be synced when possible.'
        };
      }

      setBookingSuccess(true);

      const bookingEvent = new CustomEvent('bookingConfirmed', {
        detail: { booking: response.data || response }
      });
      document.dispatchEvent(bookingEvent);

      setTimeout(() => {
        handleCloseModal();
        setTimeout(() => {
          if (savedLocally) {
            alert(
              `Your session with ${selectedTrainer.name} has been booked! It will sync with our servers when your session is valid/online.`
            );
          } else {
            alert(
              `Thank you for booking a session with ${selectedTrainer.name}! We'll contact you shortly to confirm your appointment.`
            );
          }
        }, 300);
      }, 2000);
    } catch (err) {
      console.error('Booking error details:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to book session';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Day helper
  const getDayFromDate = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  if (loading) {
    return (
      <section id="trainers" className="trainers-section">
        <div className="trainers-container">
          <div className="loading">Loading trainers...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="trainers" className="trainers-section">
      <div className="trainers-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="trainers-header"
          ref={ref}
        >
          <h2 className="trainers-title">
            Meet Our <span className="trainers-title-highlight">Expert Trainers</span>
          </h2>
          <p className="trainers-subtitle">
            Our certified trainers are here to guide you on your fitness journey with personalized programs and expert
            knowledge.
          </p>
        </motion.div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <p>Showing sample trainers instead.</p>
          </div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="trainers-grid"
        >
          {trainers.map((trainer) => (
            <motion.div
              key={trainer._id || `trainer-${trainer.name}`}
              variants={cardVariants}
              className="trainer-card"
            >
              {/* Profile Image */}
              <div className="trainer-image-container">
                <div className="trainer-image-wrapper">
                  <img
                    src={trainer.image}
                    alt={`Trainer ${trainer.name}`}
                    className="trainer-image"
                    loading="lazy"
                  />
                </div>
                <div className="trainer-image-overlay" />
              </div>

              {/* Trainer Info */}
              <div className="trainer-info">
                <h3 className="trainer-name">{trainer.name}</h3>
                <p className="trainer-specialization">{trainer.specialization}</p>
                <p className="trainer-bio">{trainer.bio}</p>
              </div>

              {/* Stats */}
              <div className="trainer-stats">
                <div className="stat-item">
                  <div className="stat-value-container">
                    <Users className="stat-icon" aria-hidden="true" />
                    <span className="stat-value">{trainer.stats?.clients ?? 0}</span>
                  </div>
                  <span className="stat-label">Clients</span>
                </div>
                <div className="stat-item">
                  <div className="stat-value-container">
                    <Clock className="stat-icon" aria-hidden="true" />
                    <span className="stat-value">{trainer.stats?.years ?? 0}</span>
                  </div>
                  <span className="stat-label">Years</span>
                </div>
                <div className="stat-item">
                  <div className="stat-value-container">
                    <Award className="stat-icon" aria-hidden="true" />
                    <span className="stat-value">{trainer.stats?.rating ?? 0}</span>
                  </div>
                  <span className="stat-label">Rating</span>
                </div>
              </div>

              {/* Certifications */}
              <div className="certifications">
                <div className="certifications-list">
                  {(trainer.certifications || []).map((cert, certIndex) => (
                    <span key={certIndex} className="certification-badge">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Book Session Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="book-button"
                onClick={() => handleBookSession(trainer)}
              >
                Book Session
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && selectedTrainer && (
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
              role="dialog"
              aria-labelledby="booking-modal-title"
              aria-modal="true"
            >
              <div className="booking-modal-header">
                <h3 id="booking-modal-title" className="booking-modal-title">
                  {bookingSuccess ? 'Booking Successful!' : `Book a Session with ${selectedTrainer.name}`}
                </h3>
                <button
                  className="booking-modal-close"
                  onClick={handleCloseModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="booking-success">
                  <div className="success-icon">
                    <svg viewBox="0 0 24 24" width="60" height="60">
                      <circle cx="12" cy="12" r="11" fill="#4CAF50" />
                      <path
                        d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <h4>Your session has been booked!</h4>
                  <p>We'll contact you shortly to confirm your appointment with {selectedTrainer.name}.</p>
                  <p className="booking-details">
                    <strong>Date:</strong> {new Date(bookingData.date).toLocaleDateString()}<br />
                    <strong>Time:</strong> {bookingData.time}<br />
                    <strong>Session Type:</strong>{' '}
                    {bookingData.sessionType === 'personal'
                      ? 'Personal Training'
                      : bookingData.sessionType === 'assessment'
                      ? 'Fitness Assessment'
                      : bookingData.sessionType === 'nutrition'
                      ? 'Nutrition Consultation'
                      : 'Small Group Session'}
                  </p>
                  <button
                    className="booking-modal-btn booking-modal-btn-submit"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="booking-modal-body">
                    {/* Trainer Summary */}
                    <div className="booking-trainer-summary">
                      <div className="booking-trainer-image-container">
                        <img
                          src={selectedTrainer.image}
                          alt={selectedTrainer.name}
                          className="booking-trainer-image"
                        />
                      </div>
                      <div className="booking-trainer-info">
                        <h4 className="booking-trainer-name">{selectedTrainer.name}</h4>
                        <p className="booking-trainer-specialization">{selectedTrainer.specialization}</p>
                      </div>
                    </div>

                    {!user ? (
                      <div className="login-prompt">
                        <p>Please log in to book a session with our trainers.</p>
                        <button
                          type="button"
                          className="login-link"
                          onClick={() => {
                            handleCloseModal();
                            openAuthModal('login');
                          }}
                        >
                          Log In
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Form Fields - Only if user is logged in */}
                        <div className="form-row two-columns">
                          <div className="form-group">
                            <label htmlFor="date" className="form-label">
                              <Calendar className="form-label-icon" aria-hidden="true" />
                              Preferred Date
                            </label>
                            <input
                              type="date"
                              id="date"
                              name="date"
                              value={bookingData.date}
                              onChange={handleInputChange}
                              min={today}
                              className="form-input"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="time" className="form-label">
                              <ClockIcon className="form-label-icon" aria-hidden="true" />
                              Preferred Time
                            </label>
                            <input
                              type="time"
                              id="time"
                              name="time"
                              value={bookingData.time}
                              onChange={handleInputChange}
                              className="form-input"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="sessionType" className="form-label">Session Type</label>
                            <select
                              id="sessionType"
                              name="sessionType"
                              value={bookingData.sessionType}
                              onChange={handleInputChange}
                              className="form-select"
                              required
                            >
                              <option value="personal">Personal Training (1-on-1)</option>
                              <option value="assessment">Fitness Assessment</option>
                              <option value="nutrition">Nutrition Consultation</option>
                              <option value="group">Small Group Session (2-4 people)</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="message" className="form-label">Additional Information</label>
                            <textarea
                              id="message"
                              name="message"
                              value={bookingData.message}
                              onChange={handleInputChange}
                              className="form-textarea"
                              rows="3"
                              placeholder="Tell us about your fitness goals, any injuries, or specific areas you want to focus on..."
                            ></textarea>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="booking-modal-footer">
                    <button
                      type="button"
                      className="booking-modal-btn booking-modal-btn-cancel"
                      onClick={handleCloseModal}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    {user && (
                      <button
                        type="submit"
                        className="booking-modal-btn booking-modal-btn-submit"
                        disabled={!bookingData.date || !bookingData.time || submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner"></span>
                            Processing...
                          </>
                        ) : (
                          'Book Session'
                        )}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default React.memo(TrainerProfiles);
