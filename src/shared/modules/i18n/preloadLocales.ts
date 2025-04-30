import log from 'loglevel';

import { FALLBACK_LOCALE, SUPPORTED_LOCALES } from './constants';
import { fetchLocale } from './fetchLocale';

/**
 * Load specified languages
 * @param locales Language codes to load, if empty, only load default language
 * @returns Loaded translation object
 */
export const preloadLocales = async (
  locales: string[] = []
): Promise<Record<string, Record<string, { message: string }>>> => {
  const translations: Record<string, Record<string, { message: string }>> = {};
  const localesToLoad = new Set<string>();

  localesToLoad.add(FALLBACK_LOCALE);

  locales.forEach((locale) => {
    if (SUPPORTED_LOCALES.includes(locale)) {
      localesToLoad.add(locale);
    }
  });

  try {
    for (const locale of localesToLoad) {
      try {
        translations[locale] = await fetchLocale(locale);
        log.debug(`Successfully loaded language ${locale}`);
      } catch (error) {
        log.error(`Error loading locale (${locale}):`, error);
        if (locale === FALLBACK_LOCALE) {
          translations[FALLBACK_LOCALE] = {};
        }
      }
    }
  } catch (error) {
    log.error('Error loading locales:', error);
  }

  return translations;
};
