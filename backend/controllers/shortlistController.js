const Shortlist = require('../models/Shortlist');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { getPaginationData, getSkip } = require('../utils/helpers');

// @desc   Add to shortlist
const addToShortlist = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId === req.user._id.toString()) {
      return sendError(res, 400, 'Cannot shortlist yourself');
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return sendError(res, 404, 'User not found');

    const existing = await Shortlist.findOne({ userId: req.user._id, savedUser: userId });
    if (existing) return sendError(res, 400, 'Already in shortlist');

    await Shortlist.create({ userId: req.user._id, savedUser: userId });
    sendSuccess(res, 201, 'Added to shortlist');
  } catch (err) {
    next(err);
  }
};

// @desc   Remove from shortlist
const removeFromShortlist = async (req, res, next) => {
  try {
    const result = await Shortlist.findOneAndDelete({
      userId: req.user._id,
      savedUser: req.params.userId,
    });
    if (!result) return sendError(res, 404, 'Not in shortlist');
    sendSuccess(res, 200, 'Removed from shortlist');
  } catch (err) {
    next(err);
  }
};

// @desc   Get shortlist
const getShortlist = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const total = await Shortlist.countDocuments({ userId: req.user._id });
    const items = await Shortlist.find({ userId: req.user._id })
      .populate({
        path: 'savedUser',
        select: 'firstName lastName',
        populate: { path: 'profileId', select: 'profilePhoto fullName age city state religion occupation' },
      })
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(parseInt(limit));

    sendSuccess(res, 200, 'Shortlist fetched', items, getPaginationData(page, limit, total));
  } catch (err) {
    next(err);
  }
};

module.exports = { addToShortlist, removeFromShortlist, getShortlist };
