const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const {
  getOrCreateConversation, getConversations, getMessages,
  sendMessage, getUnreadCount,
} = require('../controllers/messageController');

router.get('/conversations', protect, getConversations);
router.get('/conversations/:userId', protect, getOrCreateConversation);
router.get('/:conversationId', protect, getMessages);
router.post('/', protect, [
  body('conversationId').notEmpty().withMessage('Conversation ID required'),
  body('content').trim().notEmpty().withMessage('Message content required'),
], validate, sendMessage);
router.get('/unread/count', protect, getUnreadCount);

module.exports = router;
