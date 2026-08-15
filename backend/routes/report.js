const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  reportProfile,
  createSupportTicket,
  getMySupportTickets,
} = require('../controllers/reportController');

router.post('/profiles', protect, reportProfile);
router.post('/support', optionalAuth, createSupportTicket);
router.get('/support/mine', protect, getMySupportTickets);

module.exports = router;
