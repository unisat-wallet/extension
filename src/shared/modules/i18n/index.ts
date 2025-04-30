import log from 'loglevel';

import { FALLBACK_LOCALE, SUPPORTED_LOCALES } from './constants';
import { fetchLocale } from './fetchLocale';
import { getMessage } from './getMessage';

// Store all loaded translations
const translations: Record<string, Record<string, { message: string }>> = {};

// Current language
let currentLocale = FALLBACK_LOCALE;

/**
 * Initialize i18n module
 * @param locale Initial language
 */
export const initI18n = async (locale: string = FALLBACK_LOCALE): Promise<void> => {
  try {
    log.debug(`Initializing i18n, current language: ${locale}`);
    // If the language is not supported, use the default language
    if (!SUPPORTED_LOCALES.includes(locale)) {
      log.debug(`Unsupported language ${locale}, using default language ${FALLBACK_LOCALE}`);
      locale = FALLBACK_LOCALE;
    }

    // Set current language
    currentLocale = locale;

    await loadLocale(locale);

    if (locale !== FALLBACK_LOCALE) {
      await loadLocale(FALLBACK_LOCALE);
    }
  } catch (error) {
    log.error('Failed to initialize i18n:', error);
  }
};

/**
 * Load locale
 * @param locale
 */
async function loadLocale(locale: string): Promise<void> {
  if (translations[locale] && Object.keys(translations[locale]).length > 0) {
    log.debug(`Language ${locale} already loaded, no need to reload`);
    return;
  }

  try {
    const localeData = await fetchLocale(locale);
    translations[locale] = localeData;
  } catch (error) {
    log.error(`Failed to load language ${locale}:`, error);
    if (locale === FALLBACK_LOCALE) {
      translations[FALLBACK_LOCALE] = {};
    }
  }
}

/**
 * Change language
 * @param locale Target language
 */
export const changeLanguage = async (locale: string): Promise<void> => {
  try {
    log.debug(`Switching language to: ${locale}`);
    // If the language is not supported, use the default language
    if (!SUPPORTED_LOCALES.includes(locale)) {
      log.debug(`Unsupported language ${locale}, using default language ${FALLBACK_LOCALE}`);
      locale = FALLBACK_LOCALE;
    }

    // If it's already the current language, do nothing
    if (locale === currentLocale) {
      log.debug(`Already using ${locale} language, no need to switch`);
      return;
    }

    await loadLocale(locale);

    // Set current language
    currentLocale = locale;
    log.debug(`Current language switched to: ${currentLocale}`);

    // Save to local storage
    try {
      chrome.storage.local.set({ i18nextLng: locale });
      log.debug(`Language setting saved to local storage: ${locale}`);
    } catch (error) {
      log.error('Failed to save language setting to local storage:', error);
    }
  } catch (error) {
    log.error('Failed to change language:', error);
  }
};

/**
 * Get translated text
 * @param key Translation key
 * @param substitutions Replacement parameters
 * @returns Translated text
 */
export const t = (key: string, substitutions?: string | string[]): string => {
  try {
    // If no language is loaded, return the original key
    if (!translations[currentLocale] && !translations[FALLBACK_LOCALE]) {
      log.warn(`No language loaded, returning original key: ${key}`);
      return key;
    }

    // Try to get translation from current language
    let message = getMessage(currentLocale, translations[currentLocale], key, substitutions);

    // If current language doesn't have this translation, try to get from default language
    if (message === key && currentLocale !== FALLBACK_LOCALE) {
      log.warn(
        `Current language ${currentLocale} missing translation key: ${key}, trying to use default language ${FALLBACK_LOCALE}`
      );
      message = getMessage(FALLBACK_LOCALE, translations[FALLBACK_LOCALE], key, substitutions);
    }

    return message;
  } catch (error) {
    log.error(`Failed to get translation for key: ${key}:`, error);
    return key;
  }
};

/**
 * Get current language
 * @returns Current language code
 */
export const getCurrentLocaleAsync = async (): Promise<string> => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get('i18nextLng', (result) => {
        if (result && result.i18nextLng) {
          resolve(result.i18nextLng);
        } else {
          resolve(currentLocale);
        }
      });
    });
  }
  // fallback
  return currentLocale;
};

/**
 * Get list of supported languages
 * @returns List of supported language codes
 */
export const getSupportedLocales = (): string[] => {
  return [...SUPPORTED_LOCALES];
};

export { BROWSER_TO_APP_LOCALE_MAP, FALLBACK_LOCALE, LOCALE_NAMES, SUPPORTED_LOCALES } from './constants';
