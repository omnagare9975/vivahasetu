const Profile = require('../models/Profile');
const User = require('../models/User');
const {
  sendSuccess, sendError,
} = require('../utils/apiResponse');
const {
  calculateCompatibility,
  getMatchReasons,
  getMatchFactors,
  getOppositeGender,
  getExcludedSiblingIds,
  applyPreferenceFilters,
} = require('../services/matchService');
const { getPaginationData, getSkip } = require('../utils/helpers');

const sanitizeProfileForList = (profile) => {
  const obj = profile.toObject ? profile.toObject() : { ...profile };
  delete obj.fatherPhone;
  delete obj.motherPhone;
  delete obj.professionVerification?.documentUrl;
  delete obj.professionVerification?.documentPublicId;
  if (obj.professionVerification) {
    obj.professionVerification = { status: obj.professionVerification.status || 'not_verified' };
  }
  if (obj.siblingDetails) {
    obj.siblingDetails = obj.siblingDetails.map(({ phone, ...rest }) => rest);
  }
  if (obj.otherFamilyMembers) {
    obj.otherFamilyMembers = obj.otherFamilyMembers.map(({ phone, ...rest }) => rest);
  }
  obj.displayCaste = obj.caste === 'Other' && obj.casteOther ? obj.casteOther : obj.caste;
  return obj;
};

// @desc   Get suggested matches (opposite gender, exclude siblings, apply prefs)
const getSuggestedMatches = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const myProfile = await Profile.findOne({ userId: req.user._id });
    if (!myProfile) return sendError(res, 404, 'Complete your profile first');

    const oppositeGender = getOppositeGender(myProfile.gender);
    if (!oppositeGender) {
      return sendError(res, 400, 'Set your gender in profile to receive match suggestions');
    }

    const excludedIds = getExcludedSiblingIds(myProfile);
    // Also exclude users who linked this user as sibling
    const reverseSiblingProfiles = await Profile.find({
      'linkedSiblings.userId': req.user._id,
    }).select('userId');
    reverseSiblingProfiles.forEach((p) => excludedIds.push(p.userId.toString()));

    const uniqueExcluded = [...new Set(excludedIds.map(String))];

    const query = {
      userId: { $nin: [req.user._id, ...uniqueExcluded] },
      gender: oppositeGender,
      completionScore: { $gte: 30 },
    };

    applyPreferenceFilters(query, myProfile.partnerPreferences);

    // Soft preference filters when set
    const prefs = myProfile.partnerPreferences || {};
    if (prefs.state?.length) query.state = { $in: prefs.state };
    if (prefs.language?.length) query.motherTongue = { $in: prefs.language };
    if (prefs.education?.length) query.education = { $in: prefs.education };
    const professions = [...(prefs.occupation || []), ...(prefs.profession || [])];
    if (professions.length) query.occupation = { $in: professions };

    const fetchLimit = Math.min(parseInt(limit) * 3, 60);
    const profiles = await Profile.find(query)
      .limit(fetchLimit)
      .populate('userId', 'firstName lastName role isActive')
      .sort({ completionScore: -1, lastActive: -1 });

    let matches = profiles
      .filter((p) => p.userId?.isActive)
      .map((profile) => {
        const score = calculateCompatibility(myProfile, profile);
        const reasons = getMatchReasons(myProfile, profile);
        const factors = getMatchFactors(myProfile, profile);
        return {
          profile: sanitizeProfileForList(profile),
          compatibilityScore: score,
          matchReasons: reasons,
          matchFactors: factors,
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // If strict pref filters returned too few, fall back without state/edu/occ filters
    if (matches.length < 3) {
      const looseQuery = {
        userId: { $nin: [req.user._id, ...uniqueExcluded] },
        gender: oppositeGender,
        completionScore: { $gte: 30 },
      };
      applyPreferenceFilters(looseQuery, myProfile.partnerPreferences);
      const looseProfiles = await Profile.find(looseQuery)
        .limit(fetchLimit)
        .populate('userId', 'firstName lastName role isActive')
        .sort({ completionScore: -1, lastActive: -1 });
      matches = looseProfiles
        .filter((p) => p.userId?.isActive)
        .map((profile) => {
          const score = calculateCompatibility(myProfile, profile);
          const reasons = getMatchReasons(myProfile, profile);
          const factors = getMatchFactors(myProfile, profile);
          return {
            profile: sanitizeProfileForList(profile),
            compatibilityScore: score,
            matchReasons: reasons,
            matchFactors: factors,
          };
        })
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    }

    const total = matches.length;
    const start = getSkip(page, limit);
    const pageMatches = matches.slice(start, start + parseInt(limit));

    sendSuccess(res, 200, 'Matches fetched', pageMatches, getPaginationData(page, limit, total));
  } catch (err) {
    next(err);
  }
};

// @desc   Advanced search — defaults to opposite gender
const searchProfiles = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, ageMin, ageMax, gender, religion, caste,
      motherTongue, education, occupation, incomeMin, state, city,
      interests, hobbies,
    } = req.query;

    const myProfile = await Profile.findOne({ userId: req.user._id });
    const excludedIds = myProfile ? getExcludedSiblingIds(myProfile) : [];
    if (myProfile) {
      const reverse = await Profile.find({ 'linkedSiblings.userId': req.user._id }).select('userId');
      reverse.forEach((p) => excludedIds.push(p.userId.toString()));
    }
    const uniqueExcluded = [...new Set(excludedIds.map(String))];

    const query = {
      userId: { $nin: [req.user._id, ...uniqueExcluded] },
      completionScore: { $gte: 20 },
    };

    // Gender: explicit filter, else opposite of viewer
    if (gender && gender !== 'any') {
      query.gender = gender;
    } else if (myProfile?.gender) {
      const opposite = getOppositeGender(myProfile.gender);
      if (opposite) query.gender = opposite;
    }

    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin) query.age.$gte = parseInt(ageMin);
      if (ageMax) query.age.$lte = parseInt(ageMax);
    }
    if (religion) query.religion = new RegExp(religion, 'i');
    if (caste) {
      query.$or = [
        { caste: new RegExp(caste, 'i') },
        { casteOther: new RegExp(caste, 'i') },
      ];
    }
    if (motherTongue) query.motherTongue = new RegExp(motherTongue, 'i');
    if (education) query.education = new RegExp(education, 'i');
    if (occupation) query.occupation = new RegExp(occupation, 'i');
    if (state) query.state = new RegExp(state, 'i');
    if (city) query.city = new RegExp(city, 'i');
    if (interests) query.interests = new RegExp(interests, 'i');
    if (hobbies) query.hobbies = new RegExp(hobbies, 'i');

    const total = await Profile.countDocuments(query);
    const profiles = await Profile.find(query)
      .skip(getSkip(page, limit))
      .limit(parseInt(limit))
      .populate('userId', 'firstName lastName role isActive isSuspended')
      .sort({ isPremium: -1, completionScore: -1 });

    const results = profiles
      .filter((p) => p.userId?.isActive && !p.userId?.isSuspended)
      .map((profile) => {
        if (!myProfile) return sanitizeProfileForList(profile);
        const score = calculateCompatibility(myProfile, profile);
        const reasons = getMatchReasons(myProfile, profile);
        const factors = getMatchFactors(myProfile, profile);
        return {
          ...sanitizeProfileForList(profile),
          compatibilityScore: score,
          matchReasons: reasons,
          matchFactors: factors,
        };
      });

    sendSuccess(res, 200, 'Search results', results, getPaginationData(page, limit, total));
  } catch (err) {
    next(err);
  }
};

module.exports = { getSuggestedMatches, searchProfiles };
