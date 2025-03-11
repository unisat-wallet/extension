import { t } from '@/shared/modules/i18n';

import { SettingsAction, SettingsItemType } from './types';

export const getSettingsList = (): SettingsItemType[] => [
  {
    label: t('connected_sites'),
    value: '',
    desc: '',
    action: SettingsAction.CONNECTED_SITES,
    route: '/connected-sites',
    right: true,
    icon: 'connectedSites'
  },
  {
    label: '',
    value: '',
    desc: '',
    action: SettingsAction.SECTION_DIVIDER,
    route: '',
    right: false
  },

  {
    label: t('address_book'),
    value: t('add_frequently_used_addresses'),
    desc: '',
    action: SettingsAction.CONTACTS,
    route: '/settings/contacts',
    right: true,
    icon: 'addressBook'
  },
  {
    label: '',
    value: '',
    desc: '',
    action: SettingsAction.SECTION_DIVIDER,
    route: '',
    right: false
  },

  {
    label: t('address_type'),
    value: t('native_segwit_p2wpkh'),
    desc: '',
    action: SettingsAction.ADDRESS_TYPE,
    route: '/settings/address-type',
    right: true,
    icon: 'addressType'
  },
  {
    label: t('settings'),
    value: t('advanced_settings'),
    desc: '',
    action: SettingsAction.ADVANCED,
    route: '/settings/advanced',
    right: true,
    icon: 'advance'
  },
  {
    label: '',
    value: '',
    desc: '',
    action: SettingsAction.SECTION_DIVIDER,
    route: '',
    right: false
  },

  {
    label: t('feedback'),
    value: t('let_us_know_what_you_think'),
    desc: '',
    action: SettingsAction.FEEDBACK,
    route: '',
    right: true,
    icon: 'feedback'
  },
  {
    label: t('rate_us'),
    value: t('like_our_wallet_wed_love_your_rating'),
    desc: '',
    action: SettingsAction.RATE_US,
    route: '',
    right: true,
    icon: 'rateUs'
  },
  {
    label: t('about_us'),
    value: '',
    desc: '',
    action: SettingsAction.ABOUT_US,
    route: '/settings/about-us',
    right: true,
    icon: 'aboutUsLogo',
    badge: t('new_version')
  },
  // 5. Bottom Buttons (unchanged)
  {
    label: '',
    value: '',
    desc: t('expand_view'),
    action: SettingsAction.EXPAND_VIEW,
    route: '/settings/export-privatekey',
    right: false
  },
  {
    label: '',
    value: '',
    desc: t('lock_immediately'),
    action: SettingsAction.LOCK_WALLET,
    route: '',
    right: false
  }
];
