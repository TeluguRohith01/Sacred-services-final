const { body, param, validationResult } = require('express-validator');

// Common validation rules
const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address')
  .isLength({ max: 100 })
  .withMessage('Email cannot exceed 100 characters');

const passwordValidation = body('password')
  .isLength({ min: 6, max: 128 })
  .withMessage('Password must be between 6 and 128 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');

const nameValidation = body('name')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters')
  .matches(/^[a-zA-Z\s]+$/)
  .withMessage('Name can only contain letters and spaces');

const phoneValidation = body('phone')
  .trim()
  .matches(/^[\+]?[1-9][\d]{0,15}$/)
  .withMessage('Please provide a valid phone number')
  .isLength({ max: 20 })
  .withMessage('Phone number cannot exceed 20 characters');

// Registration validation
exports.validateRegister = [
  nameValidation,
  emailValidation,
  phoneValidation,
  passwordValidation,
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
];

// Login validation
exports.validateLogin = [
  emailValidation,
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password cannot exceed 128 characters'),
];

// Forgot password validation
exports.validateForgotPassword = [
  emailValidation,
];

// Reset password validation
exports.validateResetPassword = [
  param('resettoken')
    .isLength({ min: 64, max: 64 })
    .withMessage('Invalid reset token format')
    .matches(/^[a-f0-9]+$/)
    .withMessage('Invalid reset token format'),
  passwordValidation,
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
];

// Change password validation
exports.validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required')
    .isLength({ max: 128 })
    .withMessage('Current password cannot exceed 128 characters'),
  passwordValidation.withMessage('New password must be between 6 and 128 characters and contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
];

// Update profile validation
exports.validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number')
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  
  body('profile.address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  
  body('profile.address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('City can only contain letters and spaces'),
  
  body('profile.address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('State can only contain letters and spaces'),
  
  body('profile.address.zipCode')
    .optional()
    .trim()
    .matches(/^[0-9]{6}$/)
    .withMessage('Please provide a valid 6-digit zip code'),
  
  body('profile.address.country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Country can only contain letters and spaces'),
  
  body('profile.preferences.language')
    .optional()
    .isIn(['en', 'hi', 'bn', 'te', 'ta', 'ml', 'kn', 'gu', 'mr', 'or'])
    .withMessage('Invalid language selection'),
  
  body('profile.preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be true or false'),
  
  body('profile.preferences.notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification preference must be true or false'),
];

// Email verification token validation
exports.validateEmailVerificationToken = [
  param('token')
    .isLength({ min: 64, max: 64 })
    .withMessage('Invalid verification token format')
    .matches(/^[a-f0-9]+$/)
    .withMessage('Invalid verification token format'),
];

// Refresh token validation
exports.validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isJWT()
    .withMessage('Invalid refresh token format'),
];

// Custom validation middleware to handle errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

// Sanitize input middleware
exports.sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return typeof obj === 'string' ? sanitizeString(obj) : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);

  next();
};

// Rate limiting validation for sensitive operations
exports.validateSensitiveOperation = (req, res, next) => {
  // Add additional checks for sensitive operations
  const sensitiveFields = ['password', 'email', 'phone'];
  const hasChanges = sensitiveFields.some(field => req.body[field]);

  if (hasChanges) {
    // Add timestamp for rate limiting
    req.sensitiveOperation = true;
    req.operationTimestamp = Date.now();
  }

  next();
};

// Custom validators
exports.customValidators = {
  // Check if email is not already taken (for registration)
  isEmailAvailable: async (email, { req }) => {
    const User = require('../models/User');
    const existingUser = await User.findOne({ email });
    
    if (existingUser && (!req.user || existingUser._id.toString() !== req.user._id.toString())) {
      throw new Error('Email is already registered');
    }
    return true;
  },

  // Check if phone is not already taken
  isPhoneAvailable: async (phone, { req }) => {
    const User = require('../models/User');
    const existingUser = await User.findOne({ phone });
    
    if (existingUser && (!req.user || existingUser._id.toString() !== req.user._id.toString())) {
      throw new Error('Phone number is already registered');
    }
    return true;
  },

  // Check password strength
  isStrongPassword: (password) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      throw new Error(`Password must be at least ${minLength} characters long`);
    }

    if (!hasUpperCase) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!hasLowerCase) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!hasNumbers) {
      throw new Error('Password must contain at least one number');
    }

    // Optional: require special characters for extra security
    // if (!hasSpecialChar) {
    //   throw new Error('Password must contain at least one special character');
    // }

    return true;
  }
};