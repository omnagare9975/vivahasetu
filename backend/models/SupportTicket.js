const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true },
    subject: { type: String, trim: true, required: true, maxlength: 200 },
    message: { type: String, trim: true, required: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ['general', 'account', 'payment', 'report', 'verification', 'other'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    adminReply: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
