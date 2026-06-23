const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: String,
    razorpaySignature: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    plan: { type: String, enum: ['silver', 'gold'], required: true },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
    },
    duration: { type: Number }, // in months
    invoiceNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

// Generate invoice number before save
paymentSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = `VS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
