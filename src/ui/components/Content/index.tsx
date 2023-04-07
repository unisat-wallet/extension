import React, { CSSProperties } from 'react';

import { spacing, spacingGap } from '@/ui/theme/spacing';

import { BaseView, BaseViewProps } from '../BaseView';
import './index.less';

type Presets = keyof typeof $viewPresets;
export interface ContentProps extends BaseViewProps {
  preset?: Presets;
}
const $contentStyle = {
  backgroundColor: '#1C1919',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyItems: 'center',
  gap: spacingGap.lg,

  alignSelf: 'stretch',
  overflowY: 'auto',
  overflowX: 'hidden'
} as CSSProperties;

const $viewPresets = {
  large: Object.assign({}, $contentStyle, {
    alignItems: 'stretch',
    padding: spacing.large,
    paddingTop: 0
  }),
  middle: Object.assign({}, $contentStyle, {
    alignItems: 'center',
    justifyContent: 'center',
    width: 285,
    alignSelf: 'center'
  } as CSSProperties)
};

export function Content(props: ContentProps) {
  const { style: $styleOverride, preset, ...rest } = props;

  const $style = Object.assign({}, $viewPresets[preset || 'large'], $styleOverride);
  return <BaseView style={$style} {...rest} />;
}
