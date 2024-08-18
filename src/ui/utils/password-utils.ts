import zxcvbn from 'zxcvbn';

import { colors } from '../theme/colors';

export const MIN_PASSWORD_LENGTH = 8;
export const UNRECOGNIZED_PASSWORD_STRENGTH = 'Unrecognized password strength.';

const strongTip = 'A strong password can better protect the security of your assets';
export const getPasswordStrengthWord = (password: string) => {
  const info = zxcvbn(password);
  const strength = info.score;
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      text: 'Not long enough',
      color: colors.red,
      tip: 'Password must be at least 8 characters'
    };
  }
  if (strength < 0) {
    return {
      text: 'Unrecognized password strength',
      color: colors.red
    };
  } else if (strength < 3) {
    return {
      text: 'Weak',
      color: colors.red,
      tip: strongTip
    };
  } else if (strength === 3) {
    return {
      text: 'Average',
      color: colors.orange,
      tip: strongTip
    };
  } else {
    return {
      text: 'Strong',
      color: colors.green
    };
  }
};
