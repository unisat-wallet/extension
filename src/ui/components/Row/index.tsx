import React, { CSSProperties } from 'react';

import { spacingGap } from '@/ui/theme/spacing';

import { BaseView, BaseViewProps } from '../BaseView';
import './index.less';

export type RowProps = BaseViewProps;

const $rowStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: spacingGap.md
} as CSSProperties;

export function Row(props: RowProps) {
  const { style: $styleOverride, ...rest } = props;
  const $style = Object.assign({}, $rowStyle, $styleOverride);
  return <BaseView style={$style} {...rest} classname="row-container" />;
}
