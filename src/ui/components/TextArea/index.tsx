import React, { CSSProperties } from 'react';

import { colors } from '@/ui/theme/colors';
import { fontSizes } from '@/ui/theme/font';

import { BaseView, BaseViewProps } from '../BaseView';

export interface TextAreaProps extends BaseViewProps {
  text: string;
}

const $textAreaStyle = {
  backgroundColor: colors.bg2,
  flexWrap: 'wrap',
  padding: 10,
  userSelect: 'text',
  maxHeight: 384,
  overflow: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontSize: fontSizes.xs
} as CSSProperties;

export function TextArea(props: TextAreaProps) {
  const { style: $styleOverride, text, ...rest } = props;
  const $style = Object.assign({}, $textAreaStyle, $styleOverride);
  return (
    <BaseView style={$style} {...rest}>
      {text}
    </BaseView>
  );
}
