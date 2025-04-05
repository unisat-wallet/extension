import { IconTypes } from '@/ui/components/Icon';

export enum SettingAction {
  ADDRESS_TYPE = 'addressType',
  ADVANCED = 'advanced',
  CONTACTS = 'contacts',
  CONNECTED_SITES = 'connected-sites',
  NETWORK_TYPE = 'networkType',
  EXPAND_VIEW = 'expand-view',
  LOCK_WALLET = 'lock-wallet',
  MANAGE_WALLET = 'manage-wallet',
  ABOUT_US = 'about-us',
  RATE_US = 'rate-us',
  SECTION_DIVIDER = 'section-divider'
}

export interface SettingItemType {
  label?: string;
  value?: string;
  desc?: string;
  danger?: boolean;
  action: SettingAction;
  route: string;
  right: boolean;
  icon?: IconTypes;
  badge?: string;
}
