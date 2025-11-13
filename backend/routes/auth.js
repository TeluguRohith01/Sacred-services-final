const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
  refreshToken
} = require('../controllers/authController');

// Import middleware
const { protect, authorize, sensitiveOperationLimit, requireEmailVerification } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateUpdateProfile,
  validateEmailVerificationToken,
  validateRefreshToken,
  handleValidationErrors,
  sanitizeInput
} = require('../middleware/validation');

// Apply sanitization to all routes
router.use(sanitizeInput);

// Public routes
router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);
router.put('/reset-password/:resettoken', validateResetPassword, handleValidationErrors, resetPassword);
router.get('/verify-email/:token', validateEmailVerificationToken, handleValidationErrors, verifyEmail);
router.post('/refresh-token', validateRefreshToken, handleValidationErrors, refreshToken);

// Protected routes (require authentication)
router.use(protect); // All routes below this middleware require authentication

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', validateUpdateProfile, handleValidationErrors, updateProfile);
router.put('/change-password', 
  sensitiveOperationLimit,
  validateChangePassword, 
  handleValidationErrors, 
  changePassword
);
router.post('/resend-verification', resendEmailVerification);

// Admin only routes
router.get('/users', authorize('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = {};
    
    // Add search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }
    
    // Add status filter
    if (req.query.status) {
      if (req.query.status === 'active') {
        query.isActive = true;
      } else if (req.query.status === 'inactive') {
        query.isActive = false;
      } else if (req.query.status === 'verified') {
        query.isEmailVerified = true;
      } else if (req.query.status === 'unverified') {
        query.isEmailVerified = false;
      }
    }
    
    const users = await User.find(query)
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

router.get('/users/:id', authorize('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    
    const user = await User.findById(req.params.id)
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

router.put('/users/:id/status', authorize('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status'
      });
    }
    
    user.isActive = isActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
    
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
});

// Statistics endpoint for admin dashboard
router.get('/stats', authorize('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    
    // Get user registration trend for the last 12 months
    const registrationTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        newUsersThisMonth,
        registrationTrend
      }
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;