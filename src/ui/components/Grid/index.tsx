import React, { CSSProperties, ReactEventHandler } from 'react';

import { Gap, spacingGap } from '@/ui/theme/spacing';

export interface GridProps {
  style?: CSSProperties;
  children: React.ReactNode;
  gap?: Gap;
  onClick?: ReactEventHandler<HTMLDivElement>;
  columns?: number;
}

const $gridStyle = {
  display: 'grid',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  gap: spacingGap.md
} as CSSProperties;

export function Grid(props: GridProps) {
  const { children, style: $styleOverride, gap, columns, onClick } = props;
  const $style = Object.assign(
    {},
    $gridStyle,
    $styleOverride,
    gap ? { gap: spacingGap[gap] } : {},
    columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : {},
    onClick ? { cursor: 'pointer' } : {}
  );
  return <div style={$style}>{children}</div>;
}
