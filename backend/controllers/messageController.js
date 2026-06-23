const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Interest = require('../models/Interest');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { notificationEvents } = require('../services/notificationService');
const { getPaginationData, getSkip } = require('../utils/helpers');

// @desc   Get or create conversation
const getOrCreateConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId === req.user._id.toString()) {
      return sendError(res, 400, 'Cannot message yourself');
    }

    // Check if interest is accepted
    const acceptedInterest = await Interest.findOne({
      status: 'accepted',
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    });
    if (!acceptedInterest && req.user.role !== 'admin') {
      return sendError(res, 403, 'You can only message users who accepted your interest');
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] },
    }).populate('participants', 'firstName lastName profileId');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, userId],
      });
      conversation = await conversation.populate('participants', 'firstName lastName profileId');
    }

    sendSuccess(res, 200, 'Conversation fetched', conversation);
  } catch (err) {
    next(err);
  }
};

// @desc   Get all conversations (inbox)
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'firstName lastName profileId')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    // Add unread count per conversation for current user
    const withUnread = conversations.map((conv) => {
      const unread = conv.unreadCount?.get?.(req.user._id.toString()) || 0;
      return { ...conv.toObject(), myUnreadCount: unread };
    });

    sendSuccess(res, 200, 'Conversations fetched', withUnread);
  } catch (err) {
    next(err);
  }
};

// @desc   Get messages in conversation
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });
    if (!conversation) return sendError(res, 404, 'Conversation not found');

    const total = await Message.countDocuments({ conversationId, isDeleted: false });
    const messages = await Message.find({ conversationId, isDeleted: false })
      .populate('sender', 'firstName lastName profileId')
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(parseInt(limit));

    // Mark as read
    await Message.updateMany(
      { conversationId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true, readAt: Date.now() }
    );

    // Reset unread count
    const unreadUpdate = {};
    unreadUpdate[`unreadCount.${req.user._id}`] = 0;
    await Conversation.findByIdAndUpdate(conversationId, { $set: unreadUpdate });

    sendSuccess(res, 200, 'Messages fetched', messages.reverse(), getPaginationData(page, limit, total));
  } catch (err) {
    next(err);
  }
};

// @desc   Send message
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;
    if (!content?.trim()) return sendError(res, 400, 'Message content required');

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });
    if (!conversation) return sendError(res, 404, 'Conversation not found');

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      content: content.trim(),
    });

    // Update conversation
    const receiverId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );
    const unreadUpdate = {};
    unreadUpdate[`unreadCount.${receiverId}`] = (conversation.unreadCount?.get?.(receiverId.toString()) || 0) + 1;

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
      $set: unreadUpdate,
    });

    // Notify receiver
    const senderProfile = await Profile.findOne({ userId: req.user._id });
    notificationEvents.newMessage(receiverId.toString(), senderProfile?.fullName || req.user.firstName);

    const populated = await message.populate('sender', 'firstName lastName profileId');
    sendSuccess(res, 201, 'Message sent', populated);
  } catch (err) {
    next(err);
  }
};

// @desc   Get unread count
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      isRead: false,
      isDeleted: false,
    }).where('conversationId').in(
      (await Conversation.find({ participants: req.user._id }).select('_id')).map((c) => c._id)
    ).where('sender').ne(req.user._id);

    sendSuccess(res, 200, 'Unread count', { count });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOrCreateConversation, getConversations, getMessages, sendMessage, getUnreadCount };
