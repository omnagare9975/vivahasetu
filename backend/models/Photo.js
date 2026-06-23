const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isProfilePhoto: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Photo', photoSchema);
