import React, { CSSProperties } from 'react';

import { ColorTypes, colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';

export const svgRegistry = {
  history: './images/icons/clock-solid.svg',
  send: './images/icons/send.svg',
  receive: './images/icons/qrcode.svg',
  more: './images/icons/more.svg',
  utxo: './images/icons/utxo.svg',
  utxobg: './images/icons/utxobg.svg',

  right: './images/icons/right.svg',
  left: './images/icons/arrow-left.svg',
  down: './images/icons/down.svg',
  up: './images/icons/up.svg',
  link: './images/icons/arrow-up-right.svg',
  'inscribe-right': './images/icons/inscribe-right.svg',
  'arrow-right': './images/icons/right.svg',

  discord: '/images/icons/discord.svg',
  twitter: '/images/icons/twitter.svg',
  github: '/images/icons/github.svg',
  telegram: '/images/icons/telegram.svg',
  website: '/images/icons/website.svg',
  feedback: '/images/icons/feedback.svg',
  apidocs: '/images/icons/apidocs.svg',
  medium: '/images/icons/medium.svg',
  email: '/images/icons/email.svg',
  arrowUp: '/images/icons/arrowup.svg',
  aboutus: '/images/icons/aboutus.svg',
  offcial: '/images/icons/offcial.svg',
  btc: './images/icons/btc.svg',
  qrcode: './images/icons/qrcode.svg',
  moreInfo: './images/icons/moreinfo.svg',
  aboutUsLogo: '/images/icons/about-us-logo.svg',
  rateUs: '/images/icons/rate-us.svg',

  user: '/images/icons/user-solid.svg',
  wallet: '/images/icons/wallet-solid.svg',
  compass: './images/icons/compass-solid.svg',
  settings: './images/icons/gear-solid.svg',
  grid: './images/icons/grid-solid.svg',

  delete: '/images/icons/delete.svg',
  success: '/images/icons/success.svg',
  check: '/images/icons/check.svg',
  eye: '/images/icons/eye.svg',
  'eye-slash': '/images/icons/eye-slash.svg',
  copy: './images/icons/copy-solid.svg',
  close: './images/icons/xmark.svg',

  'circle-check': '/images/icons/circle-check.svg',
  pencil: '/images/icons/pencil.svg',
  'circle-info': '/images/icons/circle-info.svg',
  bitcoin: './images/icons/bitcoin.svg',
  'circle-question': '/images/icons/circle-question.svg',
  split: '/images/icons/scissors.svg',
  ordinals: '/images/icons/ordinals.svg',
  atomicals: '/images/icons/atomicals.svg',
  info: '/images/icons/info.svg',
  warning: '/images/icons/warning.svg',
  alert: '/images/icons/alert.svg',
  burn: ' /images/icons/burn.svg',
  risk: '/images/icons/risk.svg',

  overview: '/images/icons/overview.svg',
  merge: '/images/icons/merge.svg',
  paused: '/images/icons/paused.svg',

  unisat: './images/icons/unisat.svg',
  gas: './images/icons/gas.svg',
  fb: './images/icons/fb.svg',
  trade: './images/icons/trade.svg',
  baby: './images/icons/baby.svg',
  'claimable-baby': './images/icons/claimable-baby.svg',
  'claimed-baby': './images/icons/claimed-baby.svg',
  'staked-btc': './images/icons/staked-btc.svg',
  'baby-tip1': './images/icons/baby-tip1.svg',
  'baby-tip2': './images/icons/baby-tip2.svg',
  'baby-delegation': './images/icons/baby-delegation.svg',
  'baby-stakers': './images/icons/baby-stakers.svg',
  'baby-staking': './images/icons/baby-staking.svg',
  'baby-tvl': './images/icons/baby-tvl.svg',
  'error-boundary': '/images/icons/error-boundary.svg',

  addressType: '/images/icons/address-type.svg',
  addressBook: '/images/icons/address-book.svg',
  advance: '/images/icons/advance.svg',
  connectedSites: '/images/icons/connected-sites.svg',
  network: '/images/icons/network.svg',
  changePassword: '/images/icons/change-password.svg',
  addressBookEmpty: '/images/icons/address-book-empty.svg',
  sortAddress: '/images/icons/sort-address.svg',
  sortTop: '/images/icons/sort-top.svg',
  sortDrag: '/images/icons/sort-drag.svg',
  userContact: '/images/icons/user-contact.svg',

  checked: '/images/icons/checked.svg',
  language: '/images/icons/language.svg',

  'balance-eyes': '/images/icons/balance-eyes.svg',
  'balance-eyes-closed': '/images/icons/balance-eyes-closed.svg',
  'balance-question': '/images/icons/balance-question.svg',
  'balance-right': '/images/icons/balance-right.svg',
  'balance-unlock-right': '/images/icons/balance-unlock-right.svg',

  'brc20-single-step': '/images/icons/brc20-single-step.svg'
};

const iconImgList: Array<IconTypes> = [
  'success',
  'delete',
  'btc',
  'baby',
  'staked-btc',
  'claimable-baby',
  'claimed-baby',
  'baby-tip1',
  'baby-tip2',
  'error-boundary',
  'utxobg',
  'addressType',
  'addressBook',
  'advance',
  'connectedSites',
  'network',
  'changePassword',
  'addressBookEmpty',
  'website',
  'feedback',
  'apidocs',
  'medium',
  'email',
  'arrowUp',
  'aboutus',
  'moreInfo',
  'aboutUsLogo',
  'rateUs',
  'checked',
  'language',
  'receive',
  'send',
  'history',
  'utxo',
  'more',
  'balance-right',
  'balance-eyes',
  'balance-eyes-closed',
  'balance-question',
  'balance-unlock-right'
];

export type IconTypes = keyof typeof svgRegistry;
interface IconProps {
  /**
   * The name of the icon
   */
  icon?: IconTypes;

  /**
   * An optional tint color for the icon
   */
  color?: ColorTypes;

  /**
   * An optional size for the icon..
   */
  size?: number | string;

  /**
   * Style overrides for the icon image
   */
  style?: CSSProperties;

  /**
   * Style overrides for the icon container
   */
  containerStyle?: CSSProperties;

  /**
   * An optional function to be called when the icon is clicked
   */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
}

export function Icon(props: IconProps) {
  const {
    icon,
    color,
    size,
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    onClick,
    children
  } = props;
  if (!icon) {
    return (
      <div
        onClick={onClick}
        style={Object.assign(
          {},
          {
            color: color ? colors[color] : '#FFF',
            fontSizes: size || fontSizes.icon,
            display: 'flex'
          } as CSSProperties,
          $containerStyleOverride,
          $imageStyleOverride || {},
          onClick ? { cursor: 'pointer' } : {}
        )}>
        {children}
      </div>
    );
  }
  const iconPath = svgRegistry[icon as IconTypes];
  if (iconImgList.includes(icon)) {
    return (
      <img
        src={iconPath}
        alt=""
        style={Object.assign({}, $containerStyleOverride, {
          width: size || fontSizes.icon,
          height: size || fontSizes.icon
        })}
      />
    );
  }
  if (iconPath) {
    return (
      <div style={$containerStyleOverride}>
        <div
          onClick={onClick}
          style={Object.assign(
            {},
            {
              color: color ? colors[color] : '#FFF',
              width: size || fontSizes.icon,
              height: size || fontSizes.icon,
              backgroundColor: color ? colors[color] : '#FFF',
              maskImage: `url(${iconPath})`,
              maskSize: 'cover',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: `url(${iconPath})`,
              WebkitMaskSize: 'cover',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center'
            },
            $imageStyleOverride || {},
            onClick ? { cursor: 'pointer' } : {}
          )}
        />
      </div>
    );
  } else {
    return <div />;
  }
}
