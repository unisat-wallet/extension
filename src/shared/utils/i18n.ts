import { FALLBACK_LOCALE, SUPPORTED_LOCALES, SupportedLocale } from '@unisat/wallet-shared';
import { ProxyStorageAdapter } from '@unisat/wallet-storage';
import i18n from 'i18next';
import log from 'loglevel';
import { initReactI18next } from 'react-i18next';
const fetchLocale = async (locale: string) => {
  const res = await fetch(`./_locales/${locale}/messages.json`);
  const data: Record<string, { message: string; description: string }> = await res.json();
  return Object.keys(data).reduce((res, key) => {
    return {
      ...res,
      [key.replace(/__/g, ' ')]: data[key].message
    };
  }, {});
};

const I18N_NS = 'translations';

const addResourceBundle = async (locale: string) => {
  if (i18n.hasResourceBundle(locale, I18N_NS)) return;
  const bundle = await fetchLocale(locale);

  i18n.addResourceBundle(locale, 'translations', bundle);
};

const processSubstitutions = (
  message: string,
  substitutions?: string | string[] | Record<string, string | number>
): string => {
  try {
    if (substitutions) {
      if (typeof substitutions === 'string') {
        message = message.replace(/\$1/g, substitutions);
      } else if (Array.isArray(substitutions)) {
        substitutions.forEach((substitution, index) => {
          const regex = new RegExp(`\\$${index + 1}`, 'g');
          message = message.replace(regex, substitution);
        });
      }
    }

    return message;
  } catch (error) {
    console.error(`Error getting message for "${message}":`, error);
    return message;
  }
};

export interface TranslationMessage {
  message: string;
}

export interface Translations {
  [key: string]: TranslationMessage;
}
class I18nService {
  private currentLocale: string;
  private translations: Map<string, Translations> = new Map();
  private initialized = false;
  private storage: ProxyStorageAdapter = undefined!;

  constructor() {
    this.currentLocale = FALLBACK_LOCALE;
  }

  async init(config: { storage?: ProxyStorageAdapter }) {
    this.storage = config.storage!;

    i18n
      .use(initReactI18next) // passes i18n down to react-i18next
      .init({
        fallbackLng: 'en',
        defaultNS: 'translations',
        interpolation: {
          escapeValue: false // react already safes from xss
        }
      });

    addResourceBundle('en');

    i18n.on('languageChanged', function (lng: string) {
      addResourceBundle(lng);
    });

    if (this.storage) {
      const locale = await this.storage.get('i18nextLng');
      this.currentLocale = locale || FALLBACK_LOCALE;
      await this.loadLocale(this.currentLocale);
    }

    this.initialized = true;
  }

  private async loadLocale(locale: string): Promise<void> {
    if (this.translations.has(locale)) {
      return;
    }

    try {
      const translations = await fetchLocale(locale);
      this.translations.set(locale, translations);
    } catch (error) {
      if (locale !== FALLBACK_LOCALE) {
        await this.loadLocale(FALLBACK_LOCALE);
      }
    }
  }

  translate = (key: string, substitutions?: string | string[] | Record<string, string | number>): string => {
    if (!this.initialized) {
      log.warn('I18n not initialized, returning key');
      return key;
    }

    const translations = this.translations.get(this.currentLocale)!;
    const translation = translations[key];
    if (!translation && translation !== '') {
      log.warn(`Translation for key "${key}" not found in locale "${this.currentLocale}"`);
      return key;
    }
    const message = translation as any; // inconsistent with previous type definition
    const result = processSubstitutions(message, substitutions);

    return result;
  };

  async changeLanguage(locale: string): Promise<void> {
    if (!SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
      log.warn(`Locale ${locale} is not supported`);
      return;
    }

    try {
      await this.loadLocale(locale);
      this.currentLocale = locale;
      if (this.storage) {
        await this.storage.set('i18nextLng', locale);
      }

      log.debug(`Language changed to: ${locale}`);
    } catch (error) {
      log.error(`Failed to change language to ${locale}:`, error);
      throw error;
    }
  }

  getCurrentLocale(): string {
    return this.currentLocale;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const i18nService = new I18nService();
