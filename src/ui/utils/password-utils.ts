import { t } from '@unisat/i18n';

import { colors } from '../theme/colors';

export const MIN_PASSWORD_LENGTH = 8;
export const UNRECOGNIZED_PASSWORD_STRENGTH = 'Unrecognized password strength.';

const calculatePasswordStrength = (password: string): number => {
  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1; // lowercase
  if (/[A-Z]/.test(password)) score += 1; // uppercase
  if (/[0-9]/.test(password)) score += 1; // numbers
  if (/[^A-Za-z0-9]/.test(password)) score += 1; // special characters

  // Bonus for good mix
  if (
    password.length >= 10 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  ) {
    score += 1;
  }

  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) score -= 1; // repeated characters (aaa, 111)
  if (/123|abc|qwe|asd|zxc/i.test(password)) score -= 1; // common sequences
  if (/password|123456|qwerty/i.test(password)) score -= 2; // common passwords

  return Math.max(0, Math.min(4, score));
};

export const getPasswordStrengthWord = (password: string) => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      text: t('not_long_enough'),
      color: colors.red,
      tip: t('password_must_be_at_least_8_characters')
    };
  }

  const strength = calculatePasswordStrength(password);

  if (strength <= 1) {
    return {
      text: t('weak'),
      color: colors.red,
      tip: t('strong_password_tip')
    };
  } else if (strength === 2) {
    return {
      text: t('weak'),
      color: colors.red,
      tip: t('strong_password_tip')
    };
  } else if (strength === 3) {
    return {
      text: t('average'),
      color: colors.orange,
      tip: t('strong_password_tip')
    };
  } else {
    return {
      text: t('strong'),
      color: colors.green
    };
  }
};
