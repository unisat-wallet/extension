import zxcvbn from 'zxcvbn';

import { colors } from '../theme/colors';

export const MIN_PASSWORD_LENGTH = 8;
export const UNRECOGNIZED_PASSWORD_STRENGTH = 'Unrecognized password strength.';

export const getPasswordStrengthWord = (password: string) => {
  const info = zxcvbn(password);
  const strength = info.score;
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      text: 'Password not long enough',
      color: colors.red,
      level: 0
    };
  }
  if (strength < 0) {
    return {
      text: 'Unrecognized password strength',
      color: colors.red,
      level: 0
    };
  } else if (strength < 3) {
    return {
      text: 'Weak',
      color: colors.red,
      level: 1
    };
  } else if (strength === 3) {
    return {
      text: 'Average',
      color: colors.orange,
      level: 2
    };
  } else {
    return {
      text: 'Strong',
      color: colors.green,
      level: 3
    };
  }
};
