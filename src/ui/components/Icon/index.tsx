import React, { CSSProperties } from 'react';

export const svgRegistry = {
  history: './images/icons/clock-solid.svg',
  send: './images/icons/arrow-left-right.svg',
  receive: './images/icons/qrcode.svg',

  right: './images/icons/arrow-right.svg',
  left: './images/icons/arrow-left.svg',
  down: './images/icons/down.svg',

  discord: './images/icons/discord.svg',
  twitter: './images/icons/twitter.svg',
  github: './images/icons/github.svg',

  btc: './images/icons/btc.svg',
  qrcode: './images/icons/qrcode.svg',

  user: '/images/icons/user-solid.svg',
  wallet: '/images/icons/wallet-solid.svg',
  compass: './images/icons/compass-solid.svg',
  settings: './images/icons/gear.svg',

  delete: '/images/icons/delete.svg',
  success: '/images/icons/success.svg',
  check: '/images/icons/check.svg',
  eye: '/images/icons/eye.svg',
  copy: './images/icons/copy-solid.svg'
};

export type IconTypes = keyof typeof svgRegistry;
interface IconProps {
  /**
   * The name of the icon
   */
  icon: IconTypes;

  /**
   * An optional tint color for the icon
   */
  color?: string;

  /**
   * An optional size for the icon..
   */
  size?: number;

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
}

export function Icon(props: IconProps) {
  const { icon, color, size, style: $imageStyleOverride, containerStyle: $containerStyleOverride, onClick } = props;
  const iconPath = svgRegistry[icon as IconTypes];
  if (iconPath) {
    return (
      <div style={$containerStyleOverride}>
        <div
          className="mx-4 cursor-pointer"
          onClick={onClick}
          style={Object.assign(
            {},
            {
              color: color || '#FFF',
              width: size || 16,
              height: size || 16,
              backgroundColor: '#FFF',
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
