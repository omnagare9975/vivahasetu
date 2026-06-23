const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Personal Details
    fullName: { type: String, trim: true },
    age: Number,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    maritalStatus: {
      type: String,
      enum: ['never_married', 'divorced', 'widowed', 'awaiting_divorce'],
    },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    religion: { type: String, trim: true },
    caste: { type: String, trim: true },
    subCaste: { type: String, trim: true },
    motherTongue: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true },
    nativePlace: { type: String, trim: true },

    // Professional Details
    education: { type: String, trim: true },
    educationDetails: { type: String, trim: true },
    occupation: { type: String, trim: true },
    company: { type: String, trim: true },
    annualIncome: { type: String, trim: true },
    workLocation: { type: String, trim: true },

    // Lifestyle
    diet: {
      type: String,
      enum: ['vegetarian', 'non_vegetarian', 'eggetarian', 'jain', 'vegan'],
    },
    smoking: { type: String, enum: ['no', 'occasionally', 'yes'] },
    drinking: { type: String, enum: ['no', 'occasionally', 'yes'] },

    // Family Details
    fatherOccupation: { type: String, trim: true },
    motherOccupation: { type: String, trim: true },
    familyType: { type: String, enum: ['nuclear', 'joint', 'extended'] },
    familyStatus: {
      type: String,
      enum: ['middle_class', 'upper_middle_class', 'rich', 'affluent'],
    },
    siblings: { type: Number, default: 0 },

    // About
    bio: { type: String, maxlength: 1000 },
    hobbies: [String],
    interests: [String],

    // Partner Preferences
    partnerPreferences: {
      ageMin: { type: Number },
      ageMax: { type: Number },
      heightMin: { type: Number },
      heightMax: { type: Number },
      religion: [String],
      caste: [String],
      education: [String],
      occupation: [String],
      incomeMin: { type: String },
      maritalStatus: [String],
      location: [String],
      diet: [String],
    },

    // Photos
    profilePhoto: { type: String },
    photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }],

    // Meta
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    completionScore: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    profileViews: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Calculate completion score
profileSchema.methods.calculateCompletionScore = function () {
  const fields = [
    'fullName', 'age', 'gender', 'maritalStatus', 'height', 'weight',
    'religion', 'caste', 'motherTongue', 'city', 'state',
    'education', 'occupation', 'annualIncome',
    'diet', 'bio', 'profilePhoto',
  ];
  const filled = fields.filter((f) => this[f]).length;
  this.completionScore = Math.round((filled / fields.length) * 100);
  return this.completionScore;
};

module.exports = mongoose.model('Profile', profileSchema);
