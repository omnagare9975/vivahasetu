const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const {
  sendInterest, respondToInterest, cancelInterest,
  getSentInterests, getReceivedInterests,
} = require('../controllers/interestController');

router.post('/', protect, [
  body('receiverId').notEmpty().withMessage('Receiver ID required'),
], validate, sendInterest);
router.put('/:id/respond', protect, [
  body('status').isIn(['accepted', 'rejected']).withMessage('Invalid status'),
], validate, respondToInterest);
router.delete('/:id', protect, cancelInterest);
router.get('/sent', protect, getSentInterests);
router.get('/received', protect, getReceivedInterests);

module.exports = router;
