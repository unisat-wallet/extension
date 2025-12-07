import log from 'loglevel';
import React, { useEffect, useState } from 'react';

import { I18nContext, useWallet } from '@unisat/wallet-state';

import { i18nService } from '@/shared/utils/i18n';
import {
  BROWSER_TO_APP_LOCALE_MAP,
  FALLBACK_LOCALE,
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
  SupportedLocale
} from '@unisat/wallet-shared';

// Context provider component
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<string>(FALLBACK_LOCALE);
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
          const savedLocale = localStorage.getItem('i18nextLng') as SupportedLocale;
          if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
            localeToUse = savedLocale;
            log.debug(`Using user selected language: ${savedLocale}`);
          }
        } else {
          try {
            const isFirstOpen = await wallet.getIsFirstOpen();

            if (isFirstOpen) {
              const browserLang = navigator.language as SupportedLocale;
              log.debug(`New user - Browser language: ${browserLang}`);

              const mappedLocale = BROWSER_TO_APP_LOCALE_MAP[browserLang] as SupportedLocale;
              if (mappedLocale && SUPPORTED_LOCALES.includes(mappedLocale)) {
                localeToUse = mappedLocale;
                log.debug(`Using mapped browser language: ${mappedLocale}`);
              } else if (SUPPORTED_LOCALES.includes(browserLang)) {
                localeToUse = browserLang;
                log.debug(`Using browser language: ${browserLang}`);
              } else {
                const mainLang = browserLang.split('-')[0] as SupportedLocale;
                if (SUPPORTED_LOCALES.includes(mainLang)) {
                  localeToUse = mainLang;
                  log.debug(`Using browser main language: ${mainLang}`);
                } else {
                  log.debug(`Browser language not supported, using default: ${FALLBACK_LOCALE}`);
                  localeToUse = FALLBACK_LOCALE;
                }
              }
            } else {
              log.debug('Existing user - Using default English');
              localeToUse = FALLBACK_LOCALE;
            }
          } catch (error) {
            log.error('Failed to get user status, using default language:', error);
            localeToUse = FALLBACK_LOCALE;
          }
        }

        localStorage.setItem('i18nextLng', localeToUse);
        await i18nService.changeLanguage(localeToUse);
        setLocale(localeToUse);
        setIsInitialized(true);
      } catch (error) {
        log.error('Failed to initialize i18n:', error);

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
      await i18nService.changeLanguage(newLocale);
      setLocale(newLocale);
      localStorage.setItem('userSelectedLanguage', 'true');
      localStorage.setItem('i18nextLng', newLocale);

      await wallet.setLocale(newLocale);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  // Translation function
  const t = (key: string, substitutions?: string | string[] | Record<string, string | number>) => {
    try {
      return i18nService.translate(key, substitutions as any);
    } catch (error) {
      log.error(`Translation error for key "${key}":`, error);
      return key;
    }
  };

  const specialLocales = ['es', 'ru', 'fr', 'ja'];
  const isSpecialLocale = specialLocales.includes(locale);

  // If not yet initialized, show loading
  if (!isInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100vw',
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyItems: 'center',
            alignItems: 'center'
          }}>
          <div />
        </div>
      </div>
    );
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
        t: t,
        locale,
        supportedLocales: SUPPORTED_LOCALES,
        localeNames: LOCALE_NAMES,
        changeLocale,
        isSpecialLocale
      }}>
      {children}
    </I18nContext.Provider>
  );
};
