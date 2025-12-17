// client/src/components/auth/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import AuthContext from '../contexts/AuthContext';
import '../styles/auth.css';

const Login = ({ onClose, switchToRegister }) => {
  const { login, error, clearError } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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
    
    // Clear errors when user types
    if (formError) setFormError('');
    if (error && clearError) clearError();
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return false;
    }
    
    if (!formData.password) {
      setFormError('Password is required');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setFormError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      const credentials = {
        email: formData.email.trim(),
        password: formData.password
      };
      
      await login(credentials);
      
      // Close modal on successful login
      if (onClose) {
        onClose();
      }
      
    } catch (err) {
      console.error('Login submission error:', err);
      setFormError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Log In</h2>
      
      {(formError || error) && (
        <div className="auth-error">
          {formError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-form-group">
          <label htmlFor="login-email" className="auth-label">
            <Mail className="auth-icon" />
            Email
          </label>
          <input
            type="email"
            id="login-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="auth-input"
            placeholder="Enter your email"
            required
            autoComplete="email"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="auth-form-group">
          <label htmlFor="login-password" className="auth-label">
            <Lock className="auth-icon" />
            Password
          </label>
          <input
            type="password"
            id="login-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="auth-input"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            disabled={isSubmitting}
          />
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
              Logging in...
            </>
          ) : (
            <>
              <LogIn className="auth-button-icon" />
              Log In
            </>
          )}
        </motion.button>
      </form>
      
      <div className="auth-footer">
        <p>Don't have an account?</p>
        <button 
          onClick={switchToRegister} 
          className="auth-switch-button"
          type="button"
          disabled={isSubmitting}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Login;
