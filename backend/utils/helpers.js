const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const formatHeight = (cm) => {
  if (!cm) return '';
  const inches = Math.round(cm / 2.54);
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}" (${cm} cm)`;
};

const getPaginationData = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / pageSize);
  return {
    currentPage,
    pageSize,
    totalPages,
    total,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
};

const getSkip = (page, limit) => {
  return (parseInt(page || 1) - 1) * parseInt(limit || 10);
};

module.exports = { calculateAge, formatHeight, getPaginationData, getSkip };
