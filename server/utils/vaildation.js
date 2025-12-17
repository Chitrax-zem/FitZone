// server/utils/validation.js
const validator = require('validator');

// Validate email
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

// Validate password strength
const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  });
};

// Sanitize input
const sanitizeInput = (input) => {
  return validator.escape(input);
};

// Validate phone number
const isValidPhone = (phone) => {
  // Basic validation - can be enhanced based on your requirements
  return validator.isMobilePhone(phone);
};

module.exports = {
  isValidEmail,
  isStrongPassword,
  sanitizeInput,
  isValidPhone
};
