const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    relationship: { type: String, trim: true },
    phone: { type: String, trim: true },
    maritalStatus: { type: String, trim: true },
  },
  { _id: false }
);

const linkedSiblingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    relationship: { type: String, enum: ['brother', 'sister', 'other'], default: 'other' },
  },
  { _id: false }
);

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
    height: { type: Number },
    weight: { type: Number },
    religion: { type: String, trim: true },
    caste: { type: String, trim: true },
    casteOther: { type: String, trim: true },
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

    professionVerification: {
      status: {
        type: String,
        enum: ['not_verified', 'pending', 'verified', 'rejected'],
        default: 'not_verified',
      },
      documentUrl: { type: String },
      documentPublicId: { type: String },
      submittedAt: { type: Date },
      reviewedAt: { type: Date },
      adminNote: { type: String },
    },

    // Lifestyle
    diet: {
      type: String,
      enum: ['vegetarian', 'non_vegetarian', 'eggetarian', 'jain', 'vegan'],
    },
    smoking: { type: String, enum: ['no', 'occasionally', 'yes'] },
    drinking: { type: String, enum: ['no', 'occasionally', 'yes'] },

    // Family Details
    fatherName: { type: String, trim: true },
    fatherPhone: { type: String, trim: true },
    fatherOccupation: { type: String, trim: true },
    motherName: { type: String, trim: true },
    motherPhone: { type: String, trim: true },
    motherOccupation: { type: String, trim: true },
    familyType: { type: String, enum: ['nuclear', 'joint', 'extended'] },
    familyStatus: {
      type: String,
      enum: ['middle_class', 'upper_middle_class', 'rich', 'affluent'],
    },
    siblings: { type: Number, default: 0 },
    siblingDetails: [familyMemberSchema],
    otherFamilyMembers: [familyMemberSchema],

    // Sibling profile linking (exclude from matches)
    hasSiblingOnApp: { type: Boolean, default: false },
    linkedSiblings: [linkedSiblingSchema],

    // Property / Family Background
    ownHouse: { type: Boolean, default: false },
    ownCar: { type: Boolean, default: false },
    landPropertyDetails: { type: String, trim: true, maxlength: 500 },
    nativeVillage: { type: String, trim: true },

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
      profession: [String],
      language: [String],
      state: [String],
      interests: [String],
      hobbies: [String],
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

profileSchema.methods.getDisplayCaste = function () {
  if (this.caste === 'Other' && this.casteOther) return this.casteOther;
  return this.caste;
};

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

/** Strip private family phones and verification documents for public views */
profileSchema.methods.toPublicJSON = function (viewerUserId = null, showMobile = false) {
  const obj = this.toObject({ virtuals: true });
  const isOwner = viewerUserId && this.userId.toString() === viewerUserId.toString();

  if (!isOwner) {
    delete obj.fatherPhone;
    delete obj.motherPhone;
    if (obj.siblingDetails) {
      obj.siblingDetails = obj.siblingDetails.map(({ phone, ...rest }) => rest);
    }
    if (obj.otherFamilyMembers) {
      obj.otherFamilyMembers = obj.otherFamilyMembers.map(({ phone, ...rest }) => rest);
    }
    if (obj.professionVerification) {
      obj.professionVerification = {
        status: obj.professionVerification.status || 'not_verified',
      };
    }
    delete obj.linkedSiblings;
  } else if (obj.professionVerification) {
    // Owner sees status but document URL is only via dedicated endpoint
    const { documentUrl, documentPublicId, ...safe } = obj.professionVerification;
    obj.professionVerification = {
      ...safe,
      hasDocument: Boolean(documentUrl),
    };
  }

  if (obj.caste === 'Other' && obj.casteOther) {
    obj.displayCaste = obj.casteOther;
  } else {
    obj.displayCaste = obj.caste;
  }

  return obj;
};

module.exports = mongoose.model('Profile', profileSchema);
