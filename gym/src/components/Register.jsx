// client/src/components/auth/Register.jsx
import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import AuthContext from '../contexts/AuthContext';
import '../styles/auth.css';

const Register = ({ onClose, switchToLogin }) => {
  const { register, error, clearError } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      if (clearError) clearError();
    };
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general errors
    if (formError) setFormError('');
    if (error && clearError) clearError();
  };

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Phone validation (optional but if provided should be valid)
    if (formData.phone && formData.phone.trim()) {
      const phoneDigits = formData.phone.replace(/[^0-9]/g, '');
      if (phoneDigits.length < 10) {
        errors.phone = 'Please enter a valid phone number';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setFormError('Please correct the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      };
      
      // Only include phone if it's provided
      if (formData.phone && formData.phone.trim()) {
        userData.phone = formData.phone.trim();
      }
      
      await register(userData);
      
      // Close modal on successful registration
      if (onClose) {
        onClose();
      }
      
    } catch (err) {
      console.error('Registration submission error:', err);
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Create Account</h2>
      
      {(formError || error) && (
        <div className="auth-error">
          {formError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-form-group">
          <label htmlFor="register-name" className="auth-label">
            <User className="auth-icon" />
            Full Name *
          </label>
          <input
            type="text"
            id="register-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`auth-input ${fieldErrors.name ? 'auth-input-error' : ''}`}
            placeholder="Enter your full name"
            required
            autoComplete="name"
            disabled={isSubmitting}
          />
          {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
        </div>
        
        <div className="auth-form-group">
          <label htmlFor="register-email" className="auth-label">
            <Mail className="auth-icon" />
            Email *
          </label>
          <input
            type="email"
            id="register-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`auth-input ${fieldErrors.email ? 'auth-input-error' : ''}`}
            placeholder="Enter your email"
            required
            autoComplete="email"
            disabled={isSubmitting}
          />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
        </div>
        
        <div className="auth-form-group">
          <label htmlFor="register-phone" className="auth-label">
            <Phone className="auth-icon" />
            Phone Number
          </label>
          <input
            type="tel"
            id="register-phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`auth-input ${fieldErrors.phone ? 'auth-input-error' : ''}`}
            placeholder="Enter your phone number (optional)"
            autoComplete="tel"
            disabled={isSubmitting}
          />
          {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
        </div>
        
        <div className="auth-form-group">
          <label htmlFor="register-password" className="auth-label">
            <Lock className="auth-icon" />
            Password *
          </label>
          <input
            type="password"
            id="register-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`auth-input ${fieldErrors.password ? 'auth-input-error' : ''}`}
            placeholder="Create a password (min 6 characters)"
            required
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
        </div>
        
        <div className="auth-form-group">
          <label htmlFor="register-confirm-password" className="auth-label">
            <Lock className="auth-icon" />
            Confirm Password *
          </label>
          <input
            type="password"
            id="register-confirm-password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`auth-input ${fieldErrors.confirmPassword ? 'auth-input-error' : ''}`}
            placeholder="Confirm your password"
            required
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          {fieldErrors.confirmPassword && <p className="field-error">{fieldErrors.confirmPassword}</p>}
        </div>
        
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
          className="auth-button"
        >
          {isSubmitting ? (
            <>
              <div className="auth-spinner"></div>
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus className="auth-button-icon" />
              Register
            </>
          )}
        </motion.button>
      </form>
      
      <div className="auth-footer">
        <p>Already have an account?</p>
        <button 
          onClick={switchToLogin} 
          className="auth-switch-button"
          type="button"
          disabled={isSubmitting}
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default Register;
