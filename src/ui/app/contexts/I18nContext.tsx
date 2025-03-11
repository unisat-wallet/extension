import React, { createContext, useEffect, useState } from 'react';

import {
  BROWSER_TO_APP_LOCALE_MAP,
  changeLanguage,
  FALLBACK_LOCALE,
  getCurrentLocale,
  getSupportedLocales,
  initI18n,
  LOCALE_NAMES,
  t as translate
} from '@/shared/modules/i18n';
import { useWallet } from '@/ui/utils';

interface I18nContextType {
  t: (key: string, substitutions?: string | string[]) => string;
  locale: string;
  supportedLocales: string[];
  localeNames: Record<string, string>;
  changeLocale: (locale: string) => Promise<void>;
}

// Create context
export const I18nContext = createContext<I18nContextType>({
  t: (key) => key,
  locale: FALLBACK_LOCALE,
  supportedLocales: [],
  localeNames: {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  changeLocale: async () => {}
});

// Context provider component
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState(getCurrentLocale());
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wallet = useWallet();

  // Initialize i18n
  useEffect(() => {
    const initialize = async () => {
      try {
        let localeToUse = FALLBACK_LOCALE;
        const userSelectedLanguage = localStorage.getItem('userSelectedLanguage') === 'true';

        if (userSelectedLanguage) {
          const savedLocale = localStorage.getItem('i18nextLng');
          if (savedLocale && getSupportedLocales().includes(savedLocale)) {
            localeToUse = savedLocale;
            console.log(`Using user selected language: ${savedLocale}`);
          }
        } else {
          try {
            const isFirstOpen = await wallet.getIsFirstOpen();

            if (isFirstOpen) {
              const browserLang = navigator.language;
              console.log(`New user - Browser language: ${browserLang}`);

              const mappedLocale = BROWSER_TO_APP_LOCALE_MAP[browserLang];
              if (mappedLocale && getSupportedLocales().includes(mappedLocale)) {
                localeToUse = mappedLocale;
                console.log(`Using mapped browser language: ${mappedLocale}`);
              } else if (getSupportedLocales().includes(browserLang)) {
                localeToUse = browserLang;
                console.log(`Using browser language: ${browserLang}`);
              } else {
                const mainLang = browserLang.split('-')[0];
                if (getSupportedLocales().includes(mainLang)) {
                  localeToUse = mainLang;
                  console.log(`Using browser main language: ${mainLang}`);
                } else {
                  console.log(`Browser language not supported, using default: ${FALLBACK_LOCALE}`);
                  localeToUse = FALLBACK_LOCALE;
                }
              }
            } else {
              console.log('Existing user - Using default English');
              localeToUse = FALLBACK_LOCALE;
            }
          } catch (error) {
            console.error('Failed to get user status, using default language:', error);
            localeToUse = FALLBACK_LOCALE;
          }
        }

        localStorage.setItem('i18nextLng', localeToUse);
        await initI18n(localeToUse);

        setLocale(getCurrentLocale());
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);

        setLocale(FALLBACK_LOCALE);
        setIsInitialized(true);
        setError(error instanceof Error ? error : new Error('Unknown error'));
      }
    };

    initialize();
  }, [wallet]);

  // Change language
  const changeLocale = async (newLocale: string) => {
    try {
      await changeLanguage(newLocale);
      setLocale(getCurrentLocale());

      localStorage.setItem('userSelectedLanguage', 'true');
    } catch (error) {
      console.error('Failed to change language:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  // Translation function
  const t = (key: string, substitutions?: string | string[]) => {
    try {
      return translate(key, substitutions);
    } catch (error) {
      console.error(`Translation error for key "${key}":`, error);
      return key;
    }
  };

  // If not yet initialized, show loading
  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  // If there is an error, show error message in development environment
  if (error && process.env.NODE_ENV === 'development') {
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        <h2>Error initializing i18n</h2>
        <p>{error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    );
  }

  return (
    <I18nContext.Provider
      value={{
        t,
        locale,
        supportedLocales: getSupportedLocales(),
        localeNames: LOCALE_NAMES,
        changeLocale
      }}>
      {children}
    </I18nContext.Provider>
  );
};
