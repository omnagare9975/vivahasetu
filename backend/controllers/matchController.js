const Profile = require('../models/Profile');
const User = require('../models/User');
const Interest = require('../models/Interest');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { calculateCompatibility, getMatchReasons } = require('../services/matchService');
const { getPaginationData, getSkip } = require('../utils/helpers');

// @desc   Get suggested matches
const getSuggestedMatches = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const myProfile = await Profile.findOne({ userId: req.user._id });
    if (!myProfile) return sendError(res, 404, 'Complete your profile first');

    const oppositeGender = myProfile.gender === 'male' ? 'female' : 'male';
    const query = {
      userId: { $ne: req.user._id },
      gender: oppositeGender,
      completionScore: { $gte: 30 },
    };

    // Apply partner preferences
    if (myProfile.partnerPreferences?.ageMin || myProfile.partnerPreferences?.ageMax) {
      query.age = {};
      if (myProfile.partnerPreferences.ageMin) query.age.$gte = myProfile.partnerPreferences.ageMin;
      if (myProfile.partnerPreferences.ageMax) query.age.$lte = myProfile.partnerPreferences.ageMax;
    }

    const total = await Profile.countDocuments(query);
    const profiles = await Profile.find(query)
      .skip(getSkip(page, limit))
      .limit(parseInt(limit))
      .populate('userId', 'firstName lastName role isActive')
      .sort({ completionScore: -1, lastActive: -1 });

    const matches = profiles
      .filter((p) => p.userId?.isActive)
      .map((profile) => {
        const score = calculateCompatibility(myProfile, profile);
        const reasons = getMatchReasons(myProfile, profile, score);
        return { profile, compatibilityScore: score, matchReasons: reasons };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    sendSuccess(res, 200, 'Matches fetched', matches, getPaginationData(page, limit, total));
  } catch (err) {
    next(err);
  }
};

// @desc   Advanced search
const searchProfiles = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, ageMin, ageMax, gender, religion, caste,
      motherTongue, education, occupation, incomeMin, state, city,
    } = req.query;

    const query = { userId: { $ne: req.user._id }, completionScore: { $gte: 20 } };

    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin) query.age.$gte = parseInt(ageMin);
      if (ageMax) query.age.$lte = parseInt(ageMax);
    }
    if (gender) query.gender = gender;
    if (religion) query.religion = new RegExp(religion, 'i');
    if (caste) query.caste = new RegExp(caste, 'i');
    if (motherTongue) query.motherTongue = new RegExp(motherTongue, 'i');
    if (education) query.education = new RegExp(education, 'i');
    if (occupation) query.occupation = new RegExp(occupation, 'i');
    if (state) query.state = new RegExp(state, 'i');
    if (city) query.city = new RegExp(city, 'i');

    const total = await Profile.countDocuments(query);
    const profiles = await Profile.find(query)
      .skip(getSkip(page, limit))
      .limit(parseInt(limit))
      .populate('userId', 'firstName lastName role isActive isSuspended')
      .sort({ isPremium: -1, completionScore: -1 });

    const results = profiles.filter((p) => p.userId?.isActive && !p.userId?.isSuspended);

    sendSuccess(res, 200, 'Search results', results, getPaginationData(page, limit, total));
  } catch (err) {
    next(err);
  }
};

module.exports = { getSuggestedMatches, searchProfiles };
