// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin middleware
const admin = async (req, res, next) => {
  try {
    // First run the auth middleware
    auth(req, res, () => {
      // Check if user is admin
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Trainer middleware
const trainer = async (req, res, next) => {
  try {
    // First run the auth middleware
    auth(req, res, () => {
      // Check if user is trainer or admin
      if (req.user && (req.user.role === 'trainer' || req.user.role === 'admin')) {
        next();
      } else {
        res.status(403).json({ message: 'Access denied. Trainer privileges required.' });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { auth, admin, trainer };
