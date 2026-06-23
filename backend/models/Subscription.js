const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      enum: ['free', 'silver', 'gold'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    features: {
      profileViews: { type: Number, default: 10 },
      interests: { type: Number, default: 5 },
      messages: { type: Boolean, default: false },
      priorityVisibility: { type: Boolean, default: false },
      premiumBadge: { type: Boolean, default: false },
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
