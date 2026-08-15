const User = require('../models/User');
const Profile = require('../models/Profile');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const SupportTicket = require('../models/SupportTicket');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { getPaginationData, getSkip } = require('../utils/helpers');

// @desc   Get admin dashboard analytics
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      premiumUsers,
      pendingVerifications,
      totalRevenue,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'premium' }),
      Profile.countDocuments({ verificationStatus: 'pending' }),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName email createdAt role'),
    ]);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    sendSuccess(res, 200, 'Dashboard stats', {
      totalUsers,
      activeUsers,
      premiumUsers,
      pendingVerifications,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      recentUsers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get all users (paginated)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { mobile: new RegExp(search, 'i') },
      ];
    }
    if (role) query.role = role;
    if (status === 'suspended') query.isSuspended = true;
    if (status === 'active') query.isSuspended = false;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .populate('profileId', 'profilePhoto fullName completionScore verificationStatus')
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(parseInt(limit));

    sendSuccess(res, 200, 'Users fetched', users, getPaginationData(page, limit, total));
  } catch (err) {
    next(err);
  }
};

// @desc   Suspend/Unsuspend user
const toggleUserSuspension = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');
    if (user.role === 'admin') return sendError(res, 400, 'Cannot suspend admin');

    user.isSuspended = !user.isSuspended;
    await user.save({ validateBeforeSave: false });

    const action = user.isSuspended ? 'suspended' : 'unsuspended';
    sendSuccess(res, 200, `User ${action} successfully`, { isSuspended: user.isSuspended });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete user
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');
    if (user.role === 'admin') return sendError(res, 400, 'Cannot delete admin');

    await User.findByIdAndDelete(req.params.id);
    await Profile.findOneAndDelete({ userId: req.params.id });
    sendSuccess(res, 200, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
};

// @desc   Approve/Reject profile verification
const updateVerificationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return sendError(res, 400, 'Invalid status');
    }

    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status, isVerified: status === 'approved' },
      { new: true }
    );
    if (!profile) return sendError(res, 404, 'Profile not found');

    await Notification.create({
      userId: profile.userId,
      type: status === 'approved' ? 'profile_approved' : 'profile_rejected',
      title: `Profile ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: status === 'approved'
        ? 'Your profile has been verified and approved!'
        : 'Your profile verification was rejected. Please update your profile.',
    });

    sendSuccess(res, 200, `Profile ${status}`, profile);
  } catch (err) {
    next(err);
  }
};

// @desc   Get pending verifications
const getPendingVerifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const total = await Profile.countDocuments({ verificationStatus: 'pending' });
    const profiles = await Profile.find({ verificationStatus: 'pending' })
      .populate('userId', 'firstName lastName email mobile createdAt')
      .populate('photos')
      .sort({ createdAt: 1 })
      .skip(getSkip(page, limit))
      .limit(parseInt(limit));
    sendSuccess(res, 200, 'Pending verifications', profiles, getPaginationData(page, limit, total));
  } catch (err) {
    next(err);
  }
};

// @desc   Get all payments
const getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Payment.countDocuments();
    const payments = await Payment.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(parseInt(limit));
    sendSuccess(res, 200, 'Payments fetched', payments, getPaginationData(page, limit, total));
  } catch (err) {
    next(err);
  }
};

// @desc   List profile reports
const getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;
    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('reporterId', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(parseInt(limit));
    sendSuccess(res, 200, 'Reports fetched', reports, getPaginationData(page, limit, total));
  } catch (err) {
    next(err);
  }
};

// @desc   Update report status
const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return sendError(res, 400, 'Invalid status');
    }
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    );
    if (!report) return sendError(res, 404, 'Report not found');
    sendSuccess(res, 200, 'Report updated', report);
  } catch (err) {
    next(err);
  }
};

// @desc   Pending profession verifications (includes document for admin only)
const getProfessionVerifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { 'professionVerification.status': 'pending' };
    const total = await Profile.countDocuments(query);
    const profiles = await Profile.find(query)
      .populate('userId', 'firstName lastName email mobile')
      .select('fullName occupation company professionVerification profilePhoto')
      .sort({ 'professionVerification.submittedAt': 1 })
      .skip(getSkip(page, limit))
      .limit(parseInt(limit));
    sendSuccess(res, 200, 'Profession verifications', profiles, getPaginationData(page, limit, total));
  } catch (err) {
    next(err);
  }
};

// @desc   Approve/reject profession verification
const updateProfessionVerification = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      return sendError(res, 400, 'Status must be verified or rejected');
    }
    const profile = await Profile.findById(req.params.id);
    if (!profile) return sendError(res, 404, 'Profile not found');
    if (!profile.professionVerification?.documentUrl) {
      return sendError(res, 400, 'No profession document submitted');
    }

    profile.professionVerification.status = status;
    profile.professionVerification.reviewedAt = new Date();
    profile.professionVerification.adminNote = adminNote || '';
    await profile.save({ validateBeforeSave: false });

    await Notification.create({
      userId: profile.userId,
      type: status === 'verified' ? 'profile_approved' : 'profile_rejected',
      title: status === 'verified' ? 'Profession Verified' : 'Profession Verification Rejected',
      message: status === 'verified'
        ? 'Your profession has been verified successfully.'
        : (adminNote || 'Your profession verification was rejected. Please resubmit a valid document.'),
    });

    sendSuccess(res, 200, `Profession ${status}`, {
      status: profile.professionVerification.status,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   List support tickets
const getSupportTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;
    const total = await SupportTicket.countDocuments(query);
    const tickets = await SupportTicket.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(parseInt(limit));
    sendSuccess(res, 200, 'Support tickets', tickets, getPaginationData(page, limit, total));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserSuspension,
  deleteUser,
  updateVerificationStatus,
  getPendingVerifications,
  getAllPayments,
  getReports,
  updateReportStatus,
  getProfessionVerifications,
  updateProfessionVerification,
  getSupportTickets,
};
