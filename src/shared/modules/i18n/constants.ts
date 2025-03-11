export const FALLBACK_LOCALE = 'en';

// Define the browser to app locale mapping
export const BROWSER_TO_APP_LOCALE_MAP: Record<string, string> = {
  'zh-CN': 'zh_TW',
  'zh-TW': 'zh_TW',
  'zh-Hans': 'zh_TW',
  'zh-Hant': 'zh_TW'
};

export const SUPPORTED_LOCALES = ['en', 'zh_TW', 'fr', 'es', 'ru', 'ja'];

export const LOCALE_NAMES = {
  en: 'English',
  zh_TW: '中文(繁體)',
  fr: 'Français',
  es: 'Español',
  ru: 'Русский',
  ja: '日本語'
};
