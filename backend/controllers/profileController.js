const Profile = require('../models/Profile');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { cloudinary } = require('../config/cloudinary');
const { notificationEvents } = require('../services/notificationService');
const { isValidIndianMobile, normalizeIndianMobile } = require('../utils/phoneValidation');

const FAMILY_PHONE_FIELDS = ['fatherPhone', 'motherPhone'];

const validateFamilyPhones = (body) => {
  for (const field of FAMILY_PHONE_FIELDS) {
    if (body[field] !== undefined && body[field] !== null && body[field] !== '') {
      if (!isValidIndianMobile(body[field])) {
        return `${field} must be a valid 10-digit Indian mobile number`;
      }
    }
  }
  const validateList = (list, label) => {
    if (!Array.isArray(list)) return null;
    for (const member of list) {
      if (member?.phone && !isValidIndianMobile(member.phone)) {
        return `${label} phone must be a valid 10-digit Indian mobile number`;
      }
    }
    return null;
  };
  return validateList(body.siblingDetails, 'Sibling') || validateList(body.otherFamilyMembers, 'Family member');
};

const normalizePhonesInBody = (body) => {
  FAMILY_PHONE_FIELDS.forEach((field) => {
    if (body[field]) body[field] = normalizeIndianMobile(body[field]);
  });
  ['siblingDetails', 'otherFamilyMembers'].forEach((key) => {
    if (Array.isArray(body[key])) {
      body[key] = body[key].map((m) => ({
        ...m,
        phone: m.phone ? normalizeIndianMobile(m.phone) : m.phone,
      }));
    }
  });
};

// @desc   Get own profile
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id }).populate('photos');
    if (!profile) return sendError(res, 404, 'Profile not found');
    const data = profile.toPublicJSON(req.user._id);
    sendSuccess(res, 200, 'Profile fetched', data);
  } catch (err) {
    next(err);
  }
};

// @desc   Get profile by userId (strips private family phones & docs)
const getProfileById = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser || targetUser.isSuspended) return sendError(res, 404, 'Profile not found');

    const profile = await Profile.findOne({ userId: req.params.id }).populate('photos');
    if (!profile) return sendError(res, 404, 'Profile not found');

    if (req.user && req.user._id.toString() !== req.params.id) {
      await Profile.findByIdAndUpdate(profile._id, { $inc: { profileViews: 1 } });
      const viewerProfile = await Profile.findOne({ userId: req.user._id });
      if (viewerProfile) {
        notificationEvents.profileViewed(req.params.id, viewerProfile.fullName || req.user.firstName);
      }
    }

    const viewerId = req.user?._id || null;
    const data = profile.toPublicJSON(viewerId);
    sendSuccess(res, 200, 'Profile fetched', data);
  } catch (err) {
    next(err);
  }
};

// @desc   Update profile
const updateProfile = async (req, res, next) => {
  try {
    const phoneError = validateFamilyPhones(req.body);
    if (phoneError) return sendError(res, 400, phoneError);
    normalizePhonesInBody(req.body);

    if (req.body.caste === 'Other' && !req.body.casteOther?.trim()) {
      return sendError(res, 400, 'Please enter your caste when selecting Other');
    }
    if (req.body.caste && req.body.caste !== 'Other') {
      req.body.casteOther = '';
    }

    // Resolve sibling links by email or user id
    if (Array.isArray(req.body.linkedSiblings)) {
      const resolved = [];
      for (const link of req.body.linkedSiblings) {
        if (!link) continue;
        let userId = link.userId;
        if (link.email && !userId) {
          const siblingUser = await User.findOne({ email: link.email.toLowerCase().trim() });
          if (!siblingUser) {
            return sendError(res, 400, `No Vivansa account found for sibling email: ${link.email}`);
          }
          if (siblingUser._id.toString() === req.user._id.toString()) {
            return sendError(res, 400, 'Cannot link yourself as a sibling');
          }
          userId = siblingUser._id;
        }
        if (userId) {
          if (userId.toString() === req.user._id.toString()) {
            return sendError(res, 400, 'Cannot link yourself as a sibling');
          }
          resolved.push({
            userId,
            relationship: link.relationship || 'other',
          });
        }
      }
      req.body.linkedSiblings = resolved;
      req.body.hasSiblingOnApp = resolved.length > 0 || Boolean(req.body.hasSiblingOnApp);
    }

    const allowedFields = [
      'fullName', 'maritalStatus', 'height', 'weight', 'religion', 'caste', 'casteOther',
      'subCaste', 'motherTongue', 'city', 'state', 'country', 'nativePlace',
      'education', 'educationDetails', 'occupation', 'company', 'annualIncome',
      'workLocation', 'diet', 'smoking', 'drinking',
      'fatherName', 'fatherPhone', 'fatherOccupation',
      'motherName', 'motherPhone', 'motherOccupation',
      'familyType', 'familyStatus', 'siblings',
      'siblingDetails', 'otherFamilyMembers',
      'hasSiblingOnApp', 'linkedSiblings',
      'ownHouse', 'ownCar', 'landPropertyDetails', 'nativeVillage',
      'bio', 'hobbies', 'interests',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    if (req.body.partnerPreferences && typeof req.body.partnerPreferences === 'object') {
      const prefFields = [
        'ageMin', 'ageMax', 'heightMin', 'heightMax', 'religion', 'caste',
        'education', 'occupation', 'profession', 'language', 'state',
        'interests', 'hobbies', 'incomeMin', 'maritalStatus', 'location', 'diet',
      ];
      prefFields.forEach((key) => {
        if (req.body.partnerPreferences[key] !== undefined) {
          let val = req.body.partnerPreferences[key];
          // Allow comma-separated strings from forms
          if (typeof val === 'string' && ['religion', 'caste', 'education', 'occupation', 'profession',
            'language', 'state', 'interests', 'hobbies', 'maritalStatus', 'location', 'diet'].includes(key)) {
            val = val.split(',').map((s) => s.trim()).filter(Boolean);
          }
          updateData[`partnerPreferences.${key}`] = val;
        }
      });
    }

    Object.keys(req.body).forEach((key) => {
      if (key.startsWith('partnerPreferences.')) {
        updateData[key] = req.body[key];
      }
    });

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, runValidators: false }
    ).populate('photos');

    if (!profile) return sendError(res, 404, 'Profile not found');

    profile.calculateCompletionScore();
    await profile.save({ validateBeforeSave: false });

    await User.findByIdAndUpdate(req.user._id, {
      profileCompletionScore: profile.completionScore,
    });

    sendSuccess(res, 200, 'Profile updated successfully', profile.toPublicJSON(req.user._id));
  } catch (err) {
    next(err);
  }
};

// @desc   Upload profession verification document (not publicly exposed)
const uploadProfessionDocument = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 400, 'No document uploaded');

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return sendError(res, 404, 'Profile not found');

    // Remove previous document from Cloudinary
    if (profile.professionVerification?.documentPublicId) {
      try {
        await cloudinary.uploader.destroy(profile.professionVerification.documentPublicId, {
          resource_type: 'auto',
        });
      } catch (_) { /* ignore */ }
    }

    profile.professionVerification = {
      status: 'pending',
      documentUrl: req.file.path,
      documentPublicId: req.file.filename,
      submittedAt: new Date(),
      reviewedAt: undefined,
      adminNote: undefined,
    };
    await profile.save({ validateBeforeSave: false });

    sendSuccess(res, 200, 'Profession document submitted for verification', {
      status: 'pending',
      hasDocument: true,
      submittedAt: profile.professionVerification.submittedAt,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get own profession verification status (no document URL to clients that shouldn't have it — owner gets hasDocument only)
const getProfessionVerificationStatus = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id }).select('professionVerification');
    if (!profile) return sendError(res, 404, 'Profile not found');
    const pv = profile.professionVerification || {};
    sendSuccess(res, 200, 'Profession verification status', {
      status: pv.status || 'not_verified',
      hasDocument: Boolean(pv.documentUrl),
      submittedAt: pv.submittedAt,
      reviewedAt: pv.reviewedAt,
      adminNote: pv.adminNote,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Upload photo
const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 400, 'No file uploaded');

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return sendError(res, 404, 'Profile not found');

    const existingCount = await Photo.countDocuments({ userId: req.user._id });
    if (existingCount >= 10) return sendError(res, 400, 'Maximum 10 photos allowed');

    const photo = await Photo.create({
      userId: req.user._id,
      profileId: profile._id,
      url: req.file.path,
      publicId: req.file.filename,
      isProfilePhoto: existingCount === 0,
      order: existingCount,
    });

    await Profile.findByIdAndUpdate(profile._id, {
      $push: { photos: photo._id },
      ...(existingCount === 0 ? { profilePhoto: req.file.path } : {}),
    });

    sendSuccess(res, 201, 'Photo uploaded successfully', photo);
  } catch (err) {
    next(err);
  }
};

const deletePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findOne({ _id: req.params.photoId, userId: req.user._id });
    if (!photo) return sendError(res, 404, 'Photo not found');

    await cloudinary.uploader.destroy(photo.publicId);
    await Photo.findByIdAndDelete(photo._id);
    await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $pull: { photos: photo._id } }
    );

    if (photo.isProfilePhoto) {
      const nextPhoto = await Photo.findOne({ userId: req.user._id });
      if (nextPhoto) {
        nextPhoto.isProfilePhoto = true;
        await nextPhoto.save();
        await Profile.findOneAndUpdate({ userId: req.user._id }, { profilePhoto: nextPhoto.url });
      } else {
        await Profile.findOneAndUpdate({ userId: req.user._id }, { profilePhoto: null });
      }
    }

    sendSuccess(res, 200, 'Photo deleted successfully');
  } catch (err) {
    next(err);
  }
};

const setProfilePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findOne({ _id: req.params.photoId, userId: req.user._id });
    if (!photo) return sendError(res, 404, 'Photo not found');

    await Photo.updateMany({ userId: req.user._id }, { isProfilePhoto: false });
    photo.isProfilePhoto = true;
    await photo.save();

    await Profile.findOneAndUpdate({ userId: req.user._id }, { profilePhoto: photo.url });
    sendSuccess(res, 200, 'Profile photo updated', photo);
  } catch (err) {
    next(err);
  }
};

const getMyPhotos = async (req, res, next) => {
  try {
    const photos = await Photo.find({ userId: req.user._id }).sort({ order: 1 });
    sendSuccess(res, 200, 'Photos fetched', photos);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyProfile,
  getProfileById,
  updateProfile,
  uploadPhoto,
  deletePhoto,
  setProfilePhoto,
  getMyPhotos,
  uploadProfessionDocument,
  getProfessionVerificationStatus,
};
