import log from 'loglevel';

import { FALLBACK_LOCALE } from './constants';

/**
 * Load translation file for the specified locale
 * @param locale Language code
 * @returns Translation object
 */
export const fetchLocale = async (locale: string): Promise<Record<string, { message: string }>> => {
  try {
    // Use the _locales directory to load translation files
    const response = await fetch(`/_locales/${locale}/messages.json`);
    log.debug(`Loading language file path: ${response.url}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch locale: ${locale}`);
    }

    const data: Record<string, { message: string }> = await response.json();
    log.debug(`Successfully loaded ${locale} language file, containing ${Object.keys(data).length} translation items`);

    return data;
  } catch (error) {
    log.error(`Error loading locale ${locale}:`, error);
    // If loading fails, try to load the default language
    if (locale !== FALLBACK_LOCALE) {
      return fetchLocale(FALLBACK_LOCALE);
    }
    // If the default language also fails to load, return an empty object
    return {};
  }
};
