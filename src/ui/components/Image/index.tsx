import React, { CSSProperties } from 'react';

import { fontSizes } from '@/ui/theme/font';

interface ImageProps {
  src?: string;
  size?: number | string;
  style?: CSSProperties;
  containerStyle?: CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export function Image(props: ImageProps) {
  const { src, size, style: $imageStyleOverride, onClick } = props;

  return (
    <img
      src={src}
      alt=""
      style={Object.assign({}, $imageStyleOverride, {
        width: size || fontSizes.icon,
        height: size || fontSizes.icon
      })}
    />
  );
}
