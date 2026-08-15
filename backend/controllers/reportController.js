const Report = require('../models/Report');
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { getPaginationData, getSkip } = require('../utils/helpers');

const REPORT_REASONS = ['fake_profile', 'incorrect_information', 'suspicious_activity', 'other'];

// @desc   Report a profile
const reportProfile = async (req, res, next) => {
  try {
    const { reportedUserId, reason, description } = req.body;

    if (!reportedUserId) return sendError(res, 400, 'reportedUserId is required');
    if (!REPORT_REASONS.includes(reason)) {
      return sendError(res, 400, 'Invalid report reason');
    }
    if (reportedUserId === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot report your own profile');
    }

    const target = await User.findById(reportedUserId);
    if (!target || target.isSuspended) return sendError(res, 404, 'User not found');

    // Prevent spam: one pending report per pair per 24h
    const recent = await Report.findOne({
      reporterId: req.user._id,
      reportedUserId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    if (recent) {
      return sendError(res, 429, 'You have already reported this profile recently');
    }

    const report = await Report.create({
      reporterId: req.user._id,
      reportedUserId,
      reason,
      description: description?.trim() || '',
    });

    sendSuccess(res, 201, 'Report submitted. Our team will review it.', {
      id: report._id,
      status: report.status,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Submit help/support ticket
const createSupportTicket = async (req, res, next) => {
  try {
    const { name, email, subject, message, category } = req.body;
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return sendError(res, 400, 'Name, email, subject and message are required');
    }

    const ticket = await SupportTicket.create({
      userId: req.user?._id || undefined,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      category: category || 'general',
    });

    sendSuccess(res, 201, 'Support request submitted. We will get back to you soon.', {
      id: ticket._id,
      status: ticket.status,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get my support tickets
const getMySupportTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    sendSuccess(res, 200, 'Tickets fetched', tickets);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  reportProfile,
  createSupportTicket,
  getMySupportTickets,
  REPORT_REASONS,
};
