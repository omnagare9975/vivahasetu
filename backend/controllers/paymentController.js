const Razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const PLANS = {
  silver: { amount: 49900, duration: 3, features: { profileViews: -1, interests: -1, messages: true, priorityVisibility: false, premiumBadge: false } },
  gold: { amount: 99900, duration: 6, features: { profileViews: -1, interests: -1, messages: true, priorityVisibility: true, premiumBadge: true } },
};

// @desc   Create Razorpay order
const createOrder = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return sendError(res, 400, 'Invalid plan');

    // Validate Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id') {
      return sendError(res, 503, 'Payment gateway not configured. Please add Razorpay keys in .env');
    }

    const planDetails = PLANS[plan];
    const options = {
      amount: planDetails.amount,
      currency: 'INR',
      receipt: `vs_${req.user._id.toString().slice(-8)}_${Date.now()}`,
      notes: { userId: req.user._id.toString(), plan },
    };

    let order;
    try {
      order = await Razorpay.orders.create(options);
    } catch (razorpayErr) {
      // Razorpay SDK errors have a different structure
      const errMsg = razorpayErr?.error?.description
        || razorpayErr?.message
        || 'Failed to create payment order. Check Razorpay API keys.';
      console.error('Razorpay error:', JSON.stringify(razorpayErr));
      return sendError(res, 502, errMsg);
    }

    const payment = await Payment.create({
      userId: req.user._id,
      razorpayOrderId: order.id,
      amount: planDetails.amount / 100,
      plan,
      duration: planDetails.duration,
    });

    sendSuccess(res, 201, 'Order created', {
      orderId: order.id,
      amount: planDetails.amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Verify payment and upgrade subscription
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return sendError(res, 400, 'Payment verification failed');
    }

    const payment = await Payment.findOne({ _id: paymentId, userId: req.user._id });
    if (!payment) return sendError(res, 404, 'Payment not found');

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'paid';
    await payment.save();

    // Upgrade subscription
    const planDetails = PLANS[payment.plan];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + payment.duration);

    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.user._id },
      {
        plan: payment.plan,
        status: 'active',
        startDate: new Date(),
        endDate,
        features: planDetails.features,
        paymentId: payment._id,
      },
      { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(req.user._id, {
      role: 'premium',
      subscriptionId: subscription._id,
    });

    sendSuccess(res, 200, 'Payment verified. Subscription upgraded!', { subscription, payment });
  } catch (err) {
    next(err);
  }
};

// @desc   Get payment history
const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    sendSuccess(res, 200, 'Payment history', payments);
  } catch (err) {
    next(err);
  }
};

// @desc   Get subscription details
const getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });
    sendSuccess(res, 200, 'Subscription details', subscription);
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, verifyPayment, getPaymentHistory, getSubscription, PLANS };
