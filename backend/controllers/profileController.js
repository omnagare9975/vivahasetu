const Profile = require('../models/Profile');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { cloudinary } = require('../config/cloudinary');
const { notificationEvents } = require('../services/notificationService');

// @desc   Get own profile
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id }).populate('photos');
    if (!profile) return sendError(res, 404, 'Profile not found');
    sendSuccess(res, 200, 'Profile fetched', profile);
  } catch (err) {
    next(err);
  }
};

// @desc   Get profile by userId
const getProfileById = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser || targetUser.isSuspended) return sendError(res, 404, 'Profile not found');

    const profile = await Profile.findOne({ userId: req.params.id }).populate('photos');
    if (!profile) return sendError(res, 404, 'Profile not found');

    // Track profile view
    if (req.user && req.user._id.toString() !== req.params.id) {
      await Profile.findByIdAndUpdate(profile._id, { $inc: { profileViews: 1 } });
      const viewerProfile = await Profile.findOne({ userId: req.user._id });
      if (viewerProfile) {
        notificationEvents.profileViewed(req.params.id, viewerProfile.fullName || req.user.firstName);
      }
    }

    sendSuccess(res, 200, 'Profile fetched', profile);
  } catch (err) {
    next(err);
  }
};

// @desc   Update profile
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'fullName', 'maritalStatus', 'height', 'weight', 'religion', 'caste',
      'subCaste', 'motherTongue', 'city', 'state', 'country', 'nativePlace',
      'education', 'educationDetails', 'occupation', 'company', 'annualIncome',
      'workLocation', 'diet', 'smoking', 'drinking', 'fatherOccupation',
      'motherOccupation', 'familyType', 'familyStatus', 'siblings',
      'bio', 'hobbies', 'interests',
    ];

    const updateData = {};

    // Handle top-level fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    // Handle partnerPreferences — merge nested fields using dot notation
    // Supports both full object { partnerPreferences: {...} } and
    // dot-notation keys { 'partnerPreferences.ageMin': 22 }
    if (req.body.partnerPreferences && typeof req.body.partnerPreferences === 'object') {
      const prefFields = ['ageMin', 'ageMax', 'heightMin', 'heightMax', 'religion',
        'caste', 'education', 'occupation', 'incomeMin', 'maritalStatus', 'location', 'diet'];
      prefFields.forEach((key) => {
        if (req.body.partnerPreferences[key] !== undefined) {
          updateData[`partnerPreferences.${key}`] = req.body.partnerPreferences[key];
        }
      });
    }

    // Handle dot-notation partnerPreferences keys sent directly
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

    // Recalculate completion score and save without re-running validators
    profile.calculateCompletionScore();
    await profile.save({ validateBeforeSave: false });

    await User.findByIdAndUpdate(req.user._id, {
      profileCompletionScore: profile.completionScore,
    });

    sendSuccess(res, 200, 'Profile updated successfully', profile);
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

// @desc   Delete photo
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

// @desc   Set profile photo
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

// @desc   Get user photos
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
};
