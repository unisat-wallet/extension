import { useContext } from 'react';

import { FALLBACK_LOCALE, getCurrentLocaleAsync, LOCALE_NAMES } from '@/shared/modules/i18n';
import { I18nContext } from '@/ui/app/contexts/I18nContext';

const defaultI18nContext = {
  t: (key: string) => key,
  locale: FALLBACK_LOCALE,
  supportedLocales: [FALLBACK_LOCALE],
  localeNames: LOCALE_NAMES,
  changeLocale: async () => {
    /* empty implementation */
  }
};

/**
 * Use i18n Hook
 * @returns i18n context
 */
export const useI18n = () => {
  try {
    const context = useContext(I18nContext);

    if (!context) {
      console.warn('useI18n must be used within an I18nProvider, using default context instead');
      return defaultI18nContext;
    }

    return context;
  } catch (error) {
    console.error('Error in useI18n:', error);
    return defaultI18nContext;
  }
};

/**
 * Get current language
 * @returns current language code
 */
export const getCurrentLocale = async (): Promise<string> => {
  return await getCurrentLocaleAsync();
};

/**
 * Select special languages for style adaptation
 * @returns { currentLocale: string, isSpecialLocale: boolean }
 */
export const getSpecialLocale = async () => {
  const currentLocale = await getCurrentLocale();
  const specialLocales = ['es', 'ru', 'fr', 'ja'];
  const isSpecialLocale = specialLocales.includes(currentLocale);
  return { currentLocale, isSpecialLocale };
};
