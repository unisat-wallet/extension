import zxcvbn from 'zxcvbn';

import { t } from '@/shared/modules/i18n';

import { colors } from '../theme/colors';

export const MIN_PASSWORD_LENGTH = 8;
export const UNRECOGNIZED_PASSWORD_STRENGTH = 'Unrecognized password strength.';

export const getPasswordStrengthWord = (password: string) => {
  const info = zxcvbn(password);
  const strength = info.score;
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      text: t('not_long_enough'),
      color: colors.red,
      tip: t('password_must_be_at_least_8_characters')
    };
  }
  if (strength < 0) {
    return {
      text: t('unrecognized_password_strength'),
      color: colors.red
    };
  } else if (strength < 3) {
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
