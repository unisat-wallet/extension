import { CSSProperties, useMemo } from 'react';

import { spacing, spacingGap } from '@/ui/theme/spacing';
import { getUiType } from '@/ui/utils';

import { BaseView, BaseViewProps } from '../BaseView';
import './index.less';

type Presets = keyof typeof $viewPresets;
export interface ContentProps extends BaseViewProps {
  preset?: Presets;
}
const $contentStyle = {
  backgroundColor: '#070606',
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
    padding: spacing.medium,
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
  const { isSidePanel } = getUiType();

  const $sidePanelPresets = useMemo(
    () => ({
      large: Object.assign({}, $contentStyle, {
        alignItems: 'stretch',
        padding: spacing.medium,
        paddingTop: 0
      }),
      middle: Object.assign({}, $contentStyle, {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '400px',
        alignSelf: 'center',
        padding: '0 20px'
      } as CSSProperties)
    }),
    []
  );

  const presetToUse = isSidePanel ? $sidePanelPresets[preset || 'large'] : $viewPresets[preset || 'large'];
  const $style = Object.assign({}, presetToUse, $styleOverride);

  return <BaseView style={$style} {...rest} />;
}
