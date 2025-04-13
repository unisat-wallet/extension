import { CSSProperties } from 'react';

import { colors, ColorTypes } from '@/ui/theme/colors';
import { typography } from '@/ui/theme/typography';
import { showLongNumber } from '@/ui/utils';

import { BaseView, BaseViewProps } from '../BaseView';
import './index.less';

export type Sizes = keyof typeof $sizeStyles;
type Presets = keyof typeof $presets;

export const $sizeStyles = {
  xxxl: { fontSize: 32, lineHeight: 'normal' } as CSSProperties,
  xxl: { fontSize: 24, lineHeight: 'normal' } as CSSProperties,
  xl: { fontSize: 20, lineHeight: 'normal' } as CSSProperties,
  lg: { fontSize: 18, lineHeight: 'normal' } as CSSProperties,
  md: { fontSize: 16, lineHeight: 'normal' } as CSSProperties,
  sm: { fontSize: 14, lineHeight: 'normal' } as CSSProperties,
  xs: { fontSize: 12, lineHeight: 'normal' } as CSSProperties,
  xxs: { fontSize: 10, lineHeight: 'normal' } as CSSProperties,
  xxxs: { fontSize: 8, lineHeight: 'normal' } as CSSProperties
};

const $baseStyle: CSSProperties = Object.assign({}, $sizeStyles.sm, {
  fontFamily: typography.primary.regular,
  color: colors.white_muted3,
  textAlign: 'left',
  userSelect: 'none'
} as CSSProperties);

const $presets = {
  large: Object.assign({}, $baseStyle, $sizeStyles.xl),

  title: Object.assign({}, $baseStyle, $sizeStyles.lg),
  'title-bold': Object.assign({}, $baseStyle, $sizeStyles.lg, {
    fontFamily: typography.primary.bold
  }),

  regular: Object.assign({}, $baseStyle, $sizeStyles.sm),
  'regular-bold': Object.assign({}, $baseStyle, $sizeStyles.sm, {
    fontFamily: typography.primary.bold
  }),

  bold: Object.assign({}, $baseStyle, $sizeStyles.sm, {
    fontFamily: typography.primary.bold
  }),

  sub: Object.assign({}, $baseStyle, $sizeStyles.xs, {
    color: colors.white_muted
  }),
  'sub-bold': Object.assign({}, $baseStyle, $sizeStyles.xs, {
    fontFamily: typography.primary.bold,
    color: colors.white_muted
  }),

  badge: Object.assign({}, $baseStyle, $sizeStyles.xs, {
    width: '86px',
    height: '18px',
    padding: '1px 6px',
    background: '#431A1A',
    color: '#FF6765',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as CSSProperties),

  link: Object.assign({}, $baseStyle, $sizeStyles.xs, {
    color: colors.blue,
    textDecorationLine: 'underline'
  } as CSSProperties),
  default: $baseStyle
};

export interface TextProps extends BaseViewProps {
  text?: string | number;
  preset?: Presets;
  size?: Sizes;
  color?: ColorTypes;
  textCenter?: boolean;
  textEnd?: boolean;
  wrap?: boolean;
  selectText?: boolean;
  disableTranslate?: boolean;
  digital?: boolean;
  ellipsis?: boolean;
  max1Lines?: boolean;
  max2Lines?: boolean;
}

export const $textPresets = $presets;

export function Text(props: TextProps) {
  const {
    size,
    text,
    textCenter,
    textEnd,
    wrap,
    selectText,
    disableTranslate,
    ellipsis,
    style: $styleOverride,
    max1Lines,
    max2Lines,
    ...rest
  } = props;
  const preset: Presets = props.preset || 'regular';
  const $textStyle = Object.assign(
    {},
    $presets[preset],
    size ? $sizeStyles[size] : {},
    textCenter ? { textAlign: 'center' } : {},
    textEnd ? { textAlign: 'end' } : {},
    wrap ? { overflowWrap: 'anywhere' } : {},
    selectText ? { userSelect: 'text' } : {},
    ellipsis
      ? {
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden'
        }
      : {}
  );
  const $style = Object.assign({}, $textStyle, $styleOverride);
  const textUse = props.digital ? showLongNumber(text) : text;
  let textUseClassName = '';
  if (max1Lines) {
    textUseClassName = 'span-max-lines-1';
  } else if (max2Lines) {
    textUseClassName = 'span-max-lines-2';
  }
  return (
    <BaseView style={$style} {...rest}>
      {disableTranslate ? (
        <span translate="no" className="span-text">
          {textUse}
        </span>
      ) : (
        <span className={textUseClassName}>{textUse}</span>
      )}
    </BaseView>
  );
}
