const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');
const {
  register, login, getMe, verifyEmail, forgotPassword,
  resetPassword, changePassword, updatePreferences,
} = require('../controllers/authController');

const registerRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('mobile').isMobilePhone('en-IN').withMessage('Valid Indian mobile number required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('dateOfBirth').isDate().withMessage('Valid date of birth required'),
];

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], validate, login);
router.get('/me', protect, getMe);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().withMessage('Valid email required'),
], validate, forgotPassword);
router.post('/reset-password/:token', authLimiter, [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, resetPassword);
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], validate, changePassword);
router.put('/preferences', protect, updatePreferences);

module.exports = router;
