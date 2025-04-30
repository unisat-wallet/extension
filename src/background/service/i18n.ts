import { changeLanguage, initI18n, t } from '@/shared/modules/i18n';
import { getCurrentLocale } from '@/ui/hooks/useI18n';

initI18n('en');

if (chrome && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message && message.type === 'CHANGE_LANGUAGE' && message.locale) {
      changeLanguage(message.locale);
    }
  });
}

const i18nCompatObject = {
  changeLanguage,
  t,
  getCurrentLocale
};

export { getCurrentLocale, t };

export default i18nCompatObject;
