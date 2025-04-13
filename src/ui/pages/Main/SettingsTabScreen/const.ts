import { SettingsAction, SettingsItemType } from './types';

export const SettingsListConst: SettingsItemType[] = [
  {
    label: 'Connected Sites',
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
    label: 'Address Book',
    value: 'Add frequently used addresses',
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
    label: 'Address Type',
    value: 'Native Segwit (P2WPKH) (m/84/0/0/0/0)',
    desc: '',
    action: SettingsAction.ADDRESS_TYPE,
    route: '/settings/address-type',
    right: true,
    icon: 'addressType'
  },
  {
    label: 'Settings',
    value: 'Advanced settings',
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
    label: 'Feedback',
    value: 'Let us know what you think',
    desc: '',
    action: SettingsAction.FEEDBACK,
    route: '',
    right: true,
    icon: 'feedback'
  },
  {
    label: 'Rate us',
    value: "Like our wallet? We'd love your rating!",
    desc: '',
    action: SettingsAction.RATE_US,
    route: '',
    right: true,
    icon: 'rateUs'
  },
  {
    label: 'About us',
    value: '',
    desc: '',
    action: SettingsAction.ABOUT_US,
    route: '/settings/about-us',
    right: true,
    icon: 'aboutUsLogo',
    badge: 'New version!'
  },
  // 5. Bottom Buttons (unchanged)
  {
    label: '',
    value: '',
    desc: 'Expand View ',
    action: SettingsAction.EXPAND_VIEW,
    route: '/settings/export-privatekey',
    right: false
  },
  {
    label: '',
    value: '',
    desc: 'Lock Immediately',
    action: SettingsAction.LOCK_WALLET,
    route: '',
    right: false
  }
];
