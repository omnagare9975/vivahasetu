const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { getPaginationData, getSkip } = require('../utils/helpers');

// @desc   Get notifications
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Notification.countDocuments({ userId: req.user._id });
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('relatedUser', 'firstName lastName profileId')
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    sendSuccess(res, 200, 'Notifications fetched', notifications, {
      ...getPaginationData(page, limit, total),
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Mark notification as read
const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true }
    );
    sendSuccess(res, 200, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

// @desc   Mark all as read
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    sendSuccess(res, 200, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
