import { SettingAction, SettingItemType } from './types';

export const SettingListConst: SettingItemType[] = [
  {
    label: 'Connected Sites',
    value: '',
    desc: '',
    action: SettingAction.CONNECTED_SITES,
    route: '/connected-sites',
    right: true,
    icon: 'connectedSites'
  },
  {
    label: '',
    value: '',
    desc: '',
    action: SettingAction.SECTION_DIVIDER,
    route: '',
    right: false
  },

  {
    label: 'Address Book',
    value: 'Add frequently used addresses',
    desc: '',
    action: SettingAction.CONTACTS,
    route: '/settings/contacts',
    right: true,
    icon: 'addressBook'
  },
  {
    label: '',
    value: '',
    desc: '',
    action: SettingAction.SECTION_DIVIDER,
    route: '',
    right: false
  },

  {
    label: 'Address Type',
    value: 'Native Segwit (P2WPKH) (m/84/0/0/0/0)',
    desc: '',
    action: SettingAction.ADDRESS_TYPE,
    route: '/settings/address-type',
    right: true,
    icon: 'addressType'
  },
  {
    label: 'Settings',
    value: 'Advanced settings',
    desc: '',
    action: SettingAction.ADVANCED,
    route: '/settings/advanced',
    right: true,
    icon: 'advance'
  },
  {
    label: '',
    value: '',
    desc: '',
    action: SettingAction.SECTION_DIVIDER,
    route: '',
    right: false
  },
  {
    label: 'Rate us',
    value: "Like our wallet? We'd love your rating!",
    desc: '',
    action: SettingAction.RATE_US,
    route: '',
    right: true,
    icon: 'rateUs'
  },
  {
    label: 'About us',
    value: '',
    desc: '',
    action: SettingAction.ABOUT_US,
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
    action: SettingAction.EXPAND_VIEW,
    route: '/settings/export-privatekey',
    right: false
  },
  {
    label: '',
    value: '',
    desc: 'Lock Immediately',
    action: SettingAction.LOCK_WALLET,
    route: '',
    right: false
  }
];
