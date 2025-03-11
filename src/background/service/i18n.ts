import { changeLanguage, initI18n, t } from '@/shared/modules/i18n';

initI18n('en');

const i18nCompatObject = {
  changeLanguage,
  t
};

export { t };

export default i18nCompatObject;
