/**
 * Indian mobile: exactly 10 digits, starting with 6–9.
 * Accepts optional +91 / 91 / 0 prefix and strips non-digits.
 */
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

const normalizeIndianMobile = (value) => {
  if (value === undefined || value === null) return '';
  let digits = String(value).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
};

const isValidIndianMobile = (value) => INDIAN_MOBILE_REGEX.test(normalizeIndianMobile(value));

const assertValidIndianMobile = (value, fieldName = 'mobile') => {
  const normalized = normalizeIndianMobile(value);
  if (!INDIAN_MOBILE_REGEX.test(normalized)) {
    const err = new Error(`${fieldName} must be a valid 10-digit Indian mobile number`);
    err.statusCode = 400;
    throw err;
  }
  return normalized;
};

module.exports = {
  INDIAN_MOBILE_REGEX,
  normalizeIndianMobile,
  isValidIndianMobile,
  assertValidIndianMobile,
};
