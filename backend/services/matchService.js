const normalize = (v) => (v || '').toString().trim().toLowerCase();

const arrayIncludes = (arr, value) => {
  if (!arr?.length || !value) return false;
  const n = normalize(value);
  return arr.some((item) => normalize(item) === n || normalize(item).includes(n) || n.includes(normalize(item)));
};

const arraysOverlap = (a = [], b = []) => {
  if (!a?.length || !b?.length) return false;
  const setB = new Set(b.map(normalize).filter(Boolean));
  return a.some((item) => setB.has(normalize(item)));
};

const getEffectiveCaste = (profile) => {
  if (profile.caste === 'Other' && profile.casteOther) return profile.casteOther;
  return profile.caste;
};

/**
 * Weighted compatibility using profile attributes + partner preference fit.
 * Returns 0–100.
 */
const calculateCompatibility = (myProfile, candidate) => {
  let score = 0;
  let totalWeight = 0;
  const prefs = myProfile.partnerPreferences || {};

  // Age (15)
  if (myProfile.age && candidate.age) {
    totalWeight += 15;
    const ageDiff = Math.abs(myProfile.age - candidate.age);
    if (ageDiff <= 2) score += 15;
    else if (ageDiff <= 5) score += 12;
    else if (ageDiff <= 10) score += 8;
    else score += 3;
  }

  // Religion (15)
  if (myProfile.religion && candidate.religion) {
    totalWeight += 15;
    if (normalize(myProfile.religion) === normalize(candidate.religion)) score += 15;
  }

  // Caste (10)
  const myCaste = getEffectiveCaste(myProfile);
  const theirCaste = getEffectiveCaste(candidate);
  if (myCaste && theirCaste) {
    totalWeight += 10;
    if (normalize(myCaste) === normalize(theirCaste)) score += 10;
  }

  // Education (10)
  if (myProfile.education && candidate.education) {
    totalWeight += 10;
    if (normalize(myProfile.education) === normalize(candidate.education)) score += 10;
    else score += 5;
  }

  // Profession / occupation (10)
  if (myProfile.occupation && candidate.occupation) {
    totalWeight += 10;
    if (normalize(myProfile.occupation) === normalize(candidate.occupation)) score += 10;
    else score += 4;
  }

  // State / location (10)
  if (myProfile.state && candidate.state) {
    totalWeight += 10;
    if (normalize(myProfile.state) === normalize(candidate.state)) {
      score += 10;
      if (myProfile.city && candidate.city && normalize(myProfile.city) === normalize(candidate.city)) {
        score += 3;
      }
    } else {
      score += 3;
    }
  }

  // Language / mother tongue (10)
  if (myProfile.motherTongue && candidate.motherTongue) {
    totalWeight += 10;
    if (normalize(myProfile.motherTongue) === normalize(candidate.motherTongue)) score += 10;
  }

  // Interests overlap (8)
  if (myProfile.interests?.length && candidate.interests?.length) {
    totalWeight += 8;
    if (arraysOverlap(myProfile.interests, candidate.interests)) score += 8;
    else score += 2;
  }

  // Hobbies overlap (7)
  if (myProfile.hobbies?.length && candidate.hobbies?.length) {
    totalWeight += 7;
    if (arraysOverlap(myProfile.hobbies, candidate.hobbies)) score += 7;
    else score += 2;
  }

  // Partner preference fit (bonus block up to 25)
  let prefScore = 0;
  let prefWeight = 0;

  const addPref = (points, matched) => {
    prefWeight += points;
    if (matched) prefScore += points;
  };

  if (prefs.ageMin || prefs.ageMax) {
    addPref(4, candidate.age &&
      (!prefs.ageMin || candidate.age >= prefs.ageMin) &&
      (!prefs.ageMax || candidate.age <= prefs.ageMax));
  }
  if (prefs.education?.length) addPref(4, arrayIncludes(prefs.education, candidate.education));
  if (prefs.occupation?.length || prefs.profession?.length) {
    const occPrefs = [...(prefs.occupation || []), ...(prefs.profession || [])];
    addPref(4, arrayIncludes(occPrefs, candidate.occupation));
  }
  if (prefs.language?.length) addPref(3, arrayIncludes(prefs.language, candidate.motherTongue));
  if (prefs.state?.length || prefs.location?.length) {
    const locPrefs = [...(prefs.state || []), ...(prefs.location || [])];
    addPref(3, arrayIncludes(locPrefs, candidate.state) || arrayIncludes(locPrefs, candidate.city));
  }
  if (prefs.religion?.length) addPref(3, arrayIncludes(prefs.religion, candidate.religion));
  if (prefs.caste?.length) addPref(2, arrayIncludes(prefs.caste, theirCaste));
  if (prefs.interests?.length) addPref(1, arraysOverlap(prefs.interests, candidate.interests || []));
  if (prefs.hobbies?.length) addPref(1, arraysOverlap(prefs.hobbies, candidate.hobbies || []));

  if (prefWeight > 0) {
    totalWeight += 25;
    score += Math.round((prefScore / prefWeight) * 25);
  }

  const percentage = totalWeight > 0 ? Math.min(Math.round((score / totalWeight) * 100), 100) : 50;
  return percentage;
};

/**
 * Human-readable match factors for UI.
 */
const getMatchReasons = (myProfile, candidate) => {
  const reasons = [];
  const prefs = myProfile.partnerPreferences || {};
  const theirCaste = getEffectiveCaste(candidate);
  const myCaste = getEffectiveCaste(myProfile);

  if (myProfile.religion && candidate.religion &&
      normalize(myProfile.religion) === normalize(candidate.religion)) {
    reasons.push('Same religion');
  }
  if (myCaste && theirCaste && normalize(myCaste) === normalize(theirCaste)) {
    reasons.push('Same caste');
  }
  if (myProfile.state && candidate.state &&
      normalize(myProfile.state) === normalize(candidate.state)) {
    reasons.push('Same state');
  }
  if (myProfile.motherTongue && candidate.motherTongue &&
      normalize(myProfile.motherTongue) === normalize(candidate.motherTongue)) {
    reasons.push('Same language');
  }
  if (myProfile.occupation && candidate.occupation &&
      normalize(myProfile.occupation) === normalize(candidate.occupation)) {
    reasons.push('Same profession');
  }
  if (myProfile.education && candidate.education &&
      normalize(myProfile.education) === normalize(candidate.education)) {
    reasons.push('Similar education');
  }
  if (arraysOverlap(myProfile.interests || [], candidate.interests || [])) {
    reasons.push('Shared interests');
  }
  if (arraysOverlap(myProfile.hobbies || [], candidate.hobbies || [])) {
    reasons.push('Shared hobbies');
  }

  const ageDiff = Math.abs((myProfile.age || 0) - (candidate.age || 0));
  if (myProfile.age && candidate.age && ageDiff <= 3) reasons.push('Close in age');

  if (prefs.education?.length && arrayIncludes(prefs.education, candidate.education)) {
    reasons.push('Matches education preference');
  }
  if ((prefs.occupation?.length || prefs.profession?.length) &&
      arrayIncludes([...(prefs.occupation || []), ...(prefs.profession || [])], candidate.occupation)) {
    reasons.push('Matches profession preference');
  }
  if (prefs.language?.length && arrayIncludes(prefs.language, candidate.motherTongue)) {
    reasons.push('Matches language preference');
  }
  if ((prefs.state?.length || prefs.location?.length) &&
      (arrayIncludes([...(prefs.state || []), ...(prefs.location || [])], candidate.state))) {
    reasons.push('Matches location preference');
  }
  if (prefs.interests?.length && arraysOverlap(prefs.interests, candidate.interests || [])) {
    reasons.push('Matches interest preference');
  }
  if (prefs.hobbies?.length && arraysOverlap(prefs.hobbies, candidate.hobbies || [])) {
    reasons.push('Matches hobby preference');
  }

  return [...new Set(reasons)];
};

/**
 * Detailed factor breakdown for match UI.
 */
const getMatchFactors = (myProfile, candidate) => {
  const prefs = myProfile.partnerPreferences || {};
  const factors = [];

  const push = (label, matched, detail) => {
    factors.push({ label, matched: Boolean(matched), detail: detail || null });
  };

  push('Language',
    myProfile.motherTongue && candidate.motherTongue &&
    normalize(myProfile.motherTongue) === normalize(candidate.motherTongue),
    candidate.motherTongue);
  push('State',
    myProfile.state && candidate.state && normalize(myProfile.state) === normalize(candidate.state),
    candidate.state);
  push('Profession',
    myProfile.occupation && candidate.occupation &&
    normalize(myProfile.occupation) === normalize(candidate.occupation),
    candidate.occupation);
  push('Education',
    myProfile.education && candidate.education &&
    normalize(myProfile.education) === normalize(candidate.education),
    candidate.education);
  push('Interests', arraysOverlap(myProfile.interests || [], candidate.interests || []));
  push('Hobbies', arraysOverlap(myProfile.hobbies || [], candidate.hobbies || []));
  push('Religion',
    myProfile.religion && candidate.religion &&
    normalize(myProfile.religion) === normalize(candidate.religion),
    candidate.religion);

  if (prefs.education?.length) {
    push('Education preference', arrayIncludes(prefs.education, candidate.education));
  }
  if (prefs.occupation?.length || prefs.profession?.length) {
    push('Profession preference',
      arrayIncludes([...(prefs.occupation || []), ...(prefs.profession || [])], candidate.occupation));
  }
  if (prefs.language?.length) {
    push('Language preference', arrayIncludes(prefs.language, candidate.motherTongue));
  }
  if (prefs.state?.length || prefs.location?.length) {
    push('State preference',
      arrayIncludes([...(prefs.state || []), ...(prefs.location || [])], candidate.state));
  }
  if (prefs.interests?.length) {
    push('Interest preference', arraysOverlap(prefs.interests, candidate.interests || []));
  }
  if (prefs.hobbies?.length) {
    push('Hobby preference', arraysOverlap(prefs.hobbies, candidate.hobbies || []));
  }

  return factors;
};

/** Opposite gender for matrimonial matching */
const getOppositeGender = (gender) => {
  if (gender === 'male') return 'female';
  if (gender === 'female') return 'male';
  return null;
};

/** Collect userIds that must never appear as matches (linked siblings, both directions) */
const getExcludedSiblingIds = (profile) => {
  const ids = new Set();
  if (profile?.linkedSiblings?.length) {
    profile.linkedSiblings.forEach((s) => {
      if (s.userId) ids.add(s.userId.toString());
    });
  }
  return [...ids];
};

/**
 * Build Mongo query filters from partner preferences (soft filters for suggestions).
 */
const applyPreferenceFilters = (query, prefs = {}) => {
  if (prefs.ageMin || prefs.ageMax) {
    query.age = query.age || {};
    if (prefs.ageMin) query.age.$gte = prefs.ageMin;
    if (prefs.ageMax) query.age.$lte = prefs.ageMax;
  }
  return query;
};

module.exports = {
  calculateCompatibility,
  getMatchReasons,
  getMatchFactors,
  getOppositeGender,
  getExcludedSiblingIds,
  applyPreferenceFilters,
  getEffectiveCaste,
  arraysOverlap,
  arrayIncludes,
};
