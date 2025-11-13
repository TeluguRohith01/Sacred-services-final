const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No user found with this token'
        });
      }

      // Check if user account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account has been deactivated'
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked'
        });
      }

      req.user = user;
      next();

    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.id);

        if (user && user.isActive && !user.isLocked) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Optional auth token invalid:', error.message);
      }
    }

    next();

  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Check if user owns the resource or is admin
exports.checkOwnership = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resource = req.resource || req.body;
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const resourceUserId = resource[resourceUserField];
    
    if (!resourceUserId || resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }

    next();
  };
};

// Rate limiting for sensitive operations
exports.sensitiveOperationLimit = (req, res, next) => {
  // This would typically use Redis or similar for distributed rate limiting
  // For now, we'll use a simple in-memory approach
  
  const key = `${req.ip}-${req.user ? req.user._id : 'anonymous'}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 3;

  if (!global.sensitiveOperations) {
    global.sensitiveOperations = new Map();
  }

  const userAttempts = global.sensitiveOperations.get(key) || [];
  
  // Remove old attempts outside the window
  const recentAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);

  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many sensitive operations. Please try again later.',
      retryAfter: Math.ceil((recentAttempts[0] + windowMs - now) / 1000)
    });
  }

  // Add current attempt
  recentAttempts.push(now);
  global.sensitiveOperations.set(key, recentAttempts);

  next();
};

// Verify email requirement for certain operations
exports.requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required to perform this action',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }

  next();
};

// Check if user can perform action based on account age
exports.checkAccountAge = (minAgeInDays = 1) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      }

    const accountAge = Date.now() - new Date(req.user.createdAt).getTime();
    const minAgeMs = minAgeInDays * 24 * 60 * 60 * 1000;

    if (accountAge < minAgeMs) {
      return res.status(403).json({
        success: false,
        message: `Account must be at least ${minAgeInDays} day(s) old to perform this action`
      });
    }

    next();
  };
};