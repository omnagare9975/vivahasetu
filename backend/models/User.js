const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    dateOfBirth: { type: Date, required: true },
    role: {
      type: String,
      enum: ['user', 'premium', 'admin'],
      default: 'user',
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    lastLogin: Date,
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    profileCompletionScore: { type: Number, default: 0 },
    notificationPreferences: {
      newInterest: { type: Boolean, default: true },
      interestAccepted: { type: Boolean, default: true },
      newMessage: { type: Boolean, default: true },
      profileViewed: { type: Boolean, default: true },
      membershipExpiry: { type: Boolean, default: true },
    },
    privacySettings: {
      showMobile: { type: Boolean, default: false },
      showEmail: { type: Boolean, default: false },
      profileVisibility: {
        type: String,
        enum: ['all', 'members', 'premium'],
        default: 'members',
      },
    },
    language: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
