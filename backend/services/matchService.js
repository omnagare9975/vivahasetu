const Profile = require('../models/Profile');

const calculateCompatibility = (profile1, profile2) => {
  let score = 0;
  let totalWeight = 0;

  // Age compatibility (20 points)
  if (profile1.age && profile2.age) {
    totalWeight += 20;
    const ageDiff = Math.abs(profile1.age - profile2.age);
    if (ageDiff <= 2) score += 20;
    else if (ageDiff <= 5) score += 15;
    else if (ageDiff <= 10) score += 10;
    else score += 5;
  }

  // Religion match (25 points)
  if (profile1.religion && profile2.religion) {
    totalWeight += 25;
    if (profile1.religion.toLowerCase() === profile2.religion.toLowerCase()) {
      score += 25;
    }
  }

  // Caste match (15 points)
  if (profile1.caste && profile2.caste) {
    totalWeight += 15;
    if (profile1.caste.toLowerCase() === profile2.caste.toLowerCase()) {
      score += 15;
    }
  }

  // Education compatibility (15 points)
  if (profile1.education && profile2.education) {
    totalWeight += 15;
    const eduOrder = ['high_school', 'diploma', 'bachelor', 'master', 'phd'];
    const idx1 = eduOrder.findIndex((e) => profile1.education?.toLowerCase().includes(e));
    const idx2 = eduOrder.findIndex((e) => profile2.education?.toLowerCase().includes(e));
    if (idx1 !== -1 && idx2 !== -1) {
      const diff = Math.abs(idx1 - idx2);
      if (diff === 0) score += 15;
      else if (diff === 1) score += 12;
      else score += 8;
    } else {
      score += 8;
    }
  }

  // Location match (15 points)
  if (profile1.state && profile2.state) {
    totalWeight += 15;
    if (profile1.state.toLowerCase() === profile2.state.toLowerCase()) {
      score += 15;
      if (profile1.city && profile2.city &&
          profile1.city.toLowerCase() === profile2.city.toLowerCase()) {
        score += 5; // bonus
      }
    } else {
      score += 5;
    }
  }

  // Mother tongue (10 points)
  if (profile1.motherTongue && profile2.motherTongue) {
    totalWeight += 10;
    if (profile1.motherTongue.toLowerCase() === profile2.motherTongue.toLowerCase()) {
      score += 10;
    }
  }

  const percentage = totalWeight > 0 ? Math.min(Math.round((score / totalWeight) * 100), 100) : 50;
  return percentage;
};

const getMatchReasons = (profile1, profile2, score) => {
  const reasons = [];
  if (profile1.religion === profile2.religion) reasons.push('Same religion');
  if (profile1.caste === profile2.caste) reasons.push('Same caste');
  if (profile1.state === profile2.state) reasons.push('Same state');
  if (profile1.motherTongue === profile2.motherTongue) reasons.push('Same mother tongue');
  const ageDiff = Math.abs((profile1.age || 0) - (profile2.age || 0));
  if (ageDiff <= 3) reasons.push('Close in age');
  return reasons;
};

module.exports = { calculateCompatibility, getMatchReasons };
