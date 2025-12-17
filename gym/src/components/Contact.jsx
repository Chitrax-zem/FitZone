import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import '../styles/contact.css'; 

// Contact info data - moved outside component
const CONTACT_INFO = [
  {
    icon: MapPin,
    title: 'Address',
    details: ['123 Fitness Street', 'Gym City, GC 12345'],
    color: 'icon-blue'
  },
  {
    icon: Phone,
    title: 'Phone',
    details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
    color: 'icon-green'
  },
  {
    icon: Mail,
    title: 'Email',
    details: ['info@fitzone.com', 'support@fitzone.com'],
    color: 'icon-purple'
  },
  {
    icon: Clock,
    title: 'Hours',
    details: ['Mon-Fri: 5:00 AM - 11:00 PM', 'Sat-Sun: 6:00 AM - 10:00 PM'],
    color: 'icon-orange'
  }
];

const Contact = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Function to handle map loading errors
  const handleMapError = () => {
    console.log('Google Maps failed to load');
    setMapError(true);
  };

  // Function to handle map loading success
  const handleMapLoad = () => {
    console.log('Google Maps loaded successfully');
    setMapLoaded(true);
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    // Phone validation (optional)
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real app, you would send the form data to your backend
      // const response = await api.post('/contact', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({
        submit: 'Failed to send message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Static map URL as fallback
  const staticMapUrl = "https://maps.googleapis.com/maps/api/staticmap?center=FitZone+Gym&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7Clabel:F%7CFitZone+Gym&key=YOUR_API_KEY";

  // Simplified map embed URL without tracking parameters
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567890123!2d-74.00597908459418!3d40.71278597932847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e5b7c8d%3A0x1234567890abcdef!2sFitZone%20Gym!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus";

  return (
    <section id="contact" className="contact-section section-padding">
      <div className="contact-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="contact-header"
          ref={ref}
        >
          <h2 className="contact-title">
            Get In <span className="contact-title-highlight">Touch</span>
          </h2>
          <p className="contact-subtitle">
            Ready to start your fitness journey? Contact us today for a free consultation 
            and let us help you achieve your goals.
          </p>
        </motion.div>

        <div className="contact-grid">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="contact-info"
          >
            <h3 className="contact-info-title">Contact Information</h3>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="contact-info-list"
            >
              {CONTACT_INFO.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={info.title}
                    variants={itemVariants}
                    className="contact-info-item"
                  >
                    <div className={`contact-info-icon-container ${info.color}`}>
                      <Icon className="contact-info-icon" />
                    </div>
                    <div className="contact-info-content">
                      <h4 className="contact-info-label">{info.title}</h4>
                      {info.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className="contact-info-text">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Google Maps Embed with Fallback */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="contact-map"
            >
              {mapError ? (
                <div className="map-fallback">
                  <div className="map-fallback-content">
                    <MapPin size={24} />
                    <p>Visit us at: 123 Fitness Street, Gym City, GC 12345</p>
                    <a 
                      href="https://maps.google.com/?q=FitZone+Gym" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="map-link"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              ) : (
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  title="FitZone Gym Location"
                  aria-label="Map showing FitZone Gym location"
                  onLoad={handleMapLoad}
                  onError={handleMapError}
                ></iframe>
              )}
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="contact-form-container"
          >
            <h3 className="contact-form-title">Send us a Message</h3>
            
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="form-success"
              >
                <CheckCircle className="success-icon" />
                Thank you! Your message has been sent successfully.
              </motion.div>
            )}
            
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="form-error-message"
              >
                {errors.submit}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                    placeholder="Enter your full name"
                    disabled={isSubmitting || isSubmitted}
                  />
                  {errors.name && (
                    <p className="form-error">{errors.name}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="contact-email" className="form-label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                    placeholder="Enter your email"
                    disabled={isSubmitting || isSubmitted}
                  />
                  {errors.email && (
                    <p className="form-error">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                    placeholder="Enter your phone number"
                    disabled={isSubmitting || isSubmitted}
                  />
                  {errors.phone && (
                    <p className="form-error">{errors.phone}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-select"
                    disabled={isSubmitting || isSubmitted}
                  >
                    <option value="">Select a subject</option>
                    <option value="membership">Membership Inquiry</option>
                    <option value="personal-training">Personal Training</option>
                    <option value="classes">Group Classes</option>
                    <option value="facilities">Facilities Tour</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className={`form-textarea ${errors.message ? 'form-input-error' : ''}`}
                  placeholder="Tell us about your fitness goals or any questions you have..."
                  disabled={isSubmitting || isSubmitted}
                ></textarea>
                {errors.message && (
                  <p className="form-error">{errors.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                whileHover={{ scale: isSubmitting || isSubmitted ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting || isSubmitted ? 1 : 0.95 }}
                className="form-submit"
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="submit-icon" />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Contact);
