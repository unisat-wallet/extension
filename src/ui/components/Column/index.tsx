import React, { CSSProperties } from 'react';

import { spacingGap } from '@/ui/theme/spacing';

import { BaseView, BaseViewProps } from '../BaseView';

export type ColumnProps = BaseViewProps;
const $columnStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  gap: spacingGap.md
} as CSSProperties;

export function Column(props: ColumnProps) {
  const { style: $styleOverride, ...rest } = props;
  const $style = Object.assign({}, $columnStyle, $styleOverride);
  return <BaseView style={$style} {...rest} />;
}
