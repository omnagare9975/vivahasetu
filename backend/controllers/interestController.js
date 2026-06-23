const Interest = require('../models/Interest');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { notificationEvents } = require('../services/notificationService');
const { getPaginationData, getSkip } = require('../utils/helpers');

// @desc   Send interest
const sendInterest = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;
    if (receiverId === req.user._id.toString()) {
      return sendError(res, 400, 'Cannot send interest to yourself');
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return sendError(res, 404, 'User not found');

    // Check subscription limit
    const subscription = await Subscription.findById(req.user.subscriptionId);
    if (subscription?.plan === 'free') {
      const interestCount = await Interest.countDocuments({ sender: req.user._id });
      if (interestCount >= (subscription.features?.interests || 5)) {
        return sendError(res, 403, 'Interest limit reached. Upgrade to Premium for unlimited interests.');
      }
    }

    const existing = await Interest.findOne({ sender: req.user._id, receiver: receiverId });
    if (existing) {
      if (existing.status === 'cancelled') {
        existing.status = 'pending';
        existing.message = message;
        await existing.save();
        const senderProfile = await Profile.findOne({ userId: req.user._id });
        notificationEvents.newInterest(receiverId, senderProfile?.fullName || req.user.firstName);
        return sendSuccess(res, 200, 'Interest resent', existing);
      }
      return sendError(res, 400, 'Interest already sent');
    }

    const interest = await Interest.create({
      sender: req.user._id,
      receiver: receiverId,
      message,
    });

    const senderProfile = await Profile.findOne({ userId: req.user._id });
    notificationEvents.newInterest(receiverId, senderProfile?.fullName || req.user.firstName);

    sendSuccess(res, 201, 'Interest sent successfully', interest);
  } catch (err) {
    next(err);
  }
};

// @desc   Respond to interest (accept/reject)
const respondToInterest = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return sendError(res, 400, 'Invalid status. Use accepted or rejected');
    }

    const interest = await Interest.findOne({ _id: req.params.id, receiver: req.user._id });
    if (!interest) return sendError(res, 404, 'Interest not found');
    if (interest.status !== 'pending') {
      return sendError(res, 400, `Interest already ${interest.status}`);
    }

    interest.status = status;
    interest.readByReceiver = true;
    await interest.save();

    if (status === 'accepted') {
      const myProfile = await Profile.findOne({ userId: req.user._id });
      notificationEvents.interestAccepted(
        interest.sender.toString(),
        myProfile?.fullName || req.user.firstName
      );
    }

    sendSuccess(res, 200, `Interest ${status}`, interest);
  } catch (err) {
    next(err);
  }
};

// @desc   Cancel interest
const cancelInterest = async (req, res, next) => {
  try {
    const interest = await Interest.findOne({ _id: req.params.id, sender: req.user._id });
    if (!interest) return sendError(res, 404, 'Interest not found');
    interest.status = 'cancelled';
    await interest.save();
    sendSuccess(res, 200, 'Interest cancelled');
  } catch (err) {
    next(err);
  }
};

// @desc   Get sent interests
const getSentInterests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const total = await Interest.countDocuments({ sender: req.user._id });
    const interests = await Interest.find({ sender: req.user._id })
      .populate({ path: 'receiver', select: 'firstName lastName', populate: { path: 'profileId', select: 'profilePhoto fullName age city' } })
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(parseInt(limit));
    sendSuccess(res, 200, 'Sent interests', interests, getPaginationData(page, limit, total));
  } catch (err) {
    next(err);
  }
};

// @desc   Get received interests
const getReceivedInterests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const total = await Interest.countDocuments({ receiver: req.user._id });
    const interests = await Interest.find({ receiver: req.user._id })
      .populate({ path: 'sender', select: 'firstName lastName', populate: { path: 'profileId', select: 'profilePhoto fullName age city' } })
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(parseInt(limit));
    sendSuccess(res, 200, 'Received interests', interests, getPaginationData(page, limit, total));
  } catch (err) {
    next(err);
  }
};

module.exports = { sendInterest, respondToInterest, cancelInterest, getSentInterests, getReceivedInterests };
