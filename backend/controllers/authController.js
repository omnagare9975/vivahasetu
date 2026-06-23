const crypto = require('crypto');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Subscription = require('../models/Subscription');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { generateAccessToken, generateRandomToken, hashToken } = require('../utils/generateToken');
const { sendEmail, emailTemplates } = require('../services/emailService');
const { calculateAge } = require('../utils/helpers');

// @desc   Register new user
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, mobile, password, gender, dateOfBirth } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return sendError(res, 400, existingUser.email === email ? 'Email already registered' : 'Mobile number already registered');
    }

    const verificationToken = generateRandomToken();
    const user = await User.create({
      firstName,
      lastName,
      email,
      mobile,
      password,
      gender,
      dateOfBirth,
      emailVerificationToken: hashToken(verificationToken),
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    // Create empty profile
    const profile = await Profile.create({
      userId: user._id,
      fullName: `${firstName} ${lastName}`,
      age: calculateAge(dateOfBirth),
      gender,
    });

    user.profileId = profile._id;

    // Create free subscription
    const subscription = await Subscription.create({
      userId: user._id,
      plan: 'free',
      features: { profileViews: 10, interests: 5, messages: false },
    });
    user.subscriptionId = subscription._id;
    await user.save();

    // Send verification email
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    try {
      const tmpl = emailTemplates.verifyEmail(firstName, verifyUrl);
      await sendEmail({ to: email, ...tmpl });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    const token = generateAccessToken(user._id);
    sendSuccess(res, 201, 'Registration successful. Please verify your email.', {
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, 'Invalid email or password');
    }
    if (user.isSuspended) return sendError(res, 403, 'Account suspended. Contact support.');

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateAccessToken(user._id);
    sendSuccess(res, 200, 'Login successful', { token, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// @desc   Get current user
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('profileId')
      .populate('subscriptionId');
    sendSuccess(res, 200, 'User fetched', user.toPublicJSON());
  } catch (err) {
    next(err);
  }
};

// @desc   Verify email
const verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = hashToken(req.params.token);
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });
    if (!user) return sendError(res, 400, 'Invalid or expired verification token');
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    sendSuccess(res, 200, 'Email verified successfully');
  } catch (err) {
    next(err);
  }
};

// @desc   Forgot password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return sendError(res, 404, 'No user found with that email');

    const resetToken = generateRandomToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    try {
      const tmpl = emailTemplates.resetPassword(user.firstName, resetUrl);
      await sendEmail({ to: email, ...tmpl });
      sendSuccess(res, 200, 'Password reset email sent');
    } catch (emailErr) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return sendError(res, 500, 'Email could not be sent');
    }
  } catch (err) {
    next(err);
  }
};

// @desc   Reset password
const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = hashToken(req.params.token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return sendError(res, 400, 'Invalid or expired reset token');
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    const token = generateAccessToken(user._id);
    sendSuccess(res, 200, 'Password reset successful', { token });
  } catch (err) {
    next(err);
  }
};

// @desc   Change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return sendError(res, 400, 'Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    sendSuccess(res, 200, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

// @desc   Update notification preferences
const updatePreferences = async (req, res, next) => {
  try {
    const { notificationPreferences, privacySettings, language } = req.body;
    const update = {};
    if (notificationPreferences) update.notificationPreferences = notificationPreferences;
    if (privacySettings) update.privacySettings = privacySettings;
    if (language) update.language = language;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    sendSuccess(res, 200, 'Preferences updated', user.toPublicJSON());
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, verifyEmail, forgotPassword, resetPassword, changePassword, updatePreferences };
