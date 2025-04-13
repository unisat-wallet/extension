import { IconTypes } from '@/ui/components/Icon';

export enum SettingsAction {
  ADDRESS_TYPE = 'addressType',
  ADVANCED = 'advanced',
  CONTACTS = 'contacts',
  CONNECTED_SITES = 'connected-sites',
  NETWORK_TYPE = 'networkType',
  EXPAND_VIEW = 'expand-view',
  LOCK_WALLET = 'lock-wallet',
  MANAGE_WALLET = 'manage-wallet',
  ABOUT_US = 'about-us',
  FEEDBACK = 'feedback',
  RATE_US = 'rate-us',
  SECTION_DIVIDER = 'section-divider'
}

export interface SettingsItemType {
  label?: string;
  value?: string;
  desc?: string;
  danger?: boolean;
  action: SettingsAction;
  route: string;
  right: boolean;
  icon?: IconTypes;
  badge?: string;
}
