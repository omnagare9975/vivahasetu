/** Indian mobile: exactly 10 digits, starting with 6–9 */
export const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

export const normalizeIndianMobile = (value) => {
  if (value === undefined || value === null) return '';
  let digits = String(value).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
};

export const validateIndianMobile = (value) => INDIAN_MOBILE_PATTERN.test(normalizeIndianMobile(value));
