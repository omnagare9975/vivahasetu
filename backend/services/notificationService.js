const Notification = require('../models/Notification');

const createNotification = async ({
  userId,
  type,
  title,
  message,
  actionUrl,
  relatedUser,
  metadata,
}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      actionUrl,
      relatedUser,
      metadata,
    });
    return notification;
  } catch (error) {
    console.error('Notification creation error:', error);
  }
};

const notificationEvents = {
  newInterest: (receiverId, senderName) =>
    createNotification({
      userId: receiverId,
      type: 'new_interest',
      title: 'New Interest Received',
      message: `${senderName} has sent you an interest request.`,
      actionUrl: '/dashboard/interests',
    }),

  interestAccepted: (senderId, acceptorName) =>
    createNotification({
      userId: senderId,
      type: 'interest_accepted',
      title: 'Interest Accepted!',
      message: `${acceptorName} has accepted your interest. You can now start messaging.`,
      actionUrl: '/dashboard/messages',
    }),

  newMessage: (receiverId, senderName) =>
    createNotification({
      userId: receiverId,
      type: 'new_message',
      title: 'New Message',
      message: `You have a new message from ${senderName}.`,
      actionUrl: '/dashboard/messages',
    }),

  profileViewed: (ownerId, viewerName) =>
    createNotification({
      userId: ownerId,
      type: 'profile_viewed',
      title: 'Profile Viewed',
      message: `${viewerName} viewed your profile.`,
      actionUrl: '/dashboard',
    }),
};

module.exports = { createNotification, notificationEvents };
