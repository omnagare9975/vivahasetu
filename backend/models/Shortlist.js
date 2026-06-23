const mongoose = require('mongoose');

const shortlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    savedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

shortlistSchema.index({ userId: 1, savedUser: 1 }, { unique: true });

module.exports = mongoose.model('Shortlist', shortlistSchema);
