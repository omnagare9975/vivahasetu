const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { createOrder, verifyPayment, getPaymentHistory, getSubscription } = require('../controllers/paymentController');

router.post('/create-order', protect, [
  body('plan').isIn(['silver', 'gold']).withMessage('Invalid plan'),
], validate, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/subscription', protect, getSubscription);

module.exports = router;
