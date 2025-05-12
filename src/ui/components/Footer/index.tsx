import { CSSProperties, useMemo } from 'react';

import { getUiType } from '@/ui/utils';

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
  const { isSidePanel } = getUiType();

  const footerStyle = useMemo(() => {
    return {
      ...$footerBaseStyle,
      backgroundColor: isSidePanel ? '#070606' : undefined,
      width: isSidePanel ? '100%' : undefined
    };
  }, [isSidePanel]);

  const $style = Object.assign({}, footerStyle, $styleOverride);
  return <BaseView style={$style} {...rest} />;
}
