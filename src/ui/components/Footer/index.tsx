import React, { CSSProperties } from 'react';

import { BaseView, BaseViewProps } from '../BaseView';

export type FooterProps = BaseViewProps;

const $footerBaseStyle = {
  display: 'block',
  minHeight: 20,
  padding: 10,
  paddingBottom: 20,
  bottom: 0
} as CSSProperties;

export function Footer(props: FooterProps) {
  const { style: $styleOverride, ...rest } = props;
  const $style = Object.assign({}, $footerBaseStyle, $styleOverride);
  return <BaseView style={$style} {...rest} />;
}
