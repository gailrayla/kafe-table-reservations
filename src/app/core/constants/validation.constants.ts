export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  NAME: /^[a-zA-Z\s\-'\.]+$/,
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PHONE_INVALID: 'Please enter a valid phone number',
  NAME_INVALID: 'Please enter a valid name',
  PARTY_SIZE_INVALID: 'Party size must be between 1 and 12',
  DATE_INVALID: 'Please select a valid date',
  TIME_INVALID: 'Please select a valid time slot',
} as const;
