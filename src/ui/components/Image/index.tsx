import React, { CSSProperties } from 'react';

import { fontSizes } from '@/ui/theme/font';

interface ImageProps {
  src?: string;
  fallbackSrc?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
  containerStyle?: CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export function Image(props: ImageProps) {
  const { src, fallbackSrc, size, width, height, style: $imageStyleOverride, onClick } = props;

  return (
    <img
      src={src}
      alt=""
      style={Object.assign({}, $imageStyleOverride, {
        width: width || size || fontSizes.icon,
        height: height || size || fontSizes.icon
      })}
      onError={(e) => {
        if (fallbackSrc && e.currentTarget.src.indexOf('unknown.png') === -1) {
          e.currentTarget.src = fallbackSrc;
        }
      }}
    />
  );
}
