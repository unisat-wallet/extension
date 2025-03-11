/**
 * Get translation text
 * @param locale Current language
 * @param translations Translation object
 * @param key Translation key
 * @param substitutions Replacement parameters
 * @returns Translated text
 */
export const getMessage = (
  locale: string,
  translations: Record<string, { message: string }> | undefined,
  key: string,
  substitutions?: string | string[]
): string => {
  try {
    // If there is no translation object, return the key name
    if (!translations) {
      // Only log warnings in development environment to avoid generating large logs in production
      if (process.env.NODE_ENV === 'development') {
        console.warn(`No translations available for locale "${locale}"`);
      }
      return key;
    }

    const translation = translations[key];

    if (!translation) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation for key "${key}" in locale "${locale}"`);
      }
      return key;
    }

    let { message } = translation;

    if (substitutions) {
      if (typeof substitutions === 'string') {
        message = message.replace(/\$1/g, substitutions);
      } else {
        substitutions.forEach((substitution, index) => {
          const regex = new RegExp(`\\$${index + 1}`, 'g');
          message = message.replace(regex, substitution);
        });
      }
    }

    return message;
  } catch (error) {
    console.error(`Error getting message for key "${key}" in locale "${locale}":`, error);
    // If an error occurs, return the key name
    return key;
  }
};
