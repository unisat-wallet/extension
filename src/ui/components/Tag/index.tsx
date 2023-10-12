import { CSSProperties } from 'react';
import { BaseView, BaseViewProps } from '../BaseView';
import { ColorTypes, colors } from '@/ui/theme/colors';
import { typography } from '@/ui/theme/typography';


type Sizes = keyof typeof $sizeStyles;
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

const $baseStyle: CSSProperties = Object.assign({}, $sizeStyles.xs, {
  fontFamily: typography.primary.regular,
  color: colors.white,
  textAlign: 'center',
  userSelect: 'none',
  display: 'inline-flex',
  borderRadius: 2,
  paddingLeft: 4,
  paddingRight: 4,
} as CSSProperties);

const $presets = {
  default: Object.assign({}, $baseStyle, {
    backgroundColor: colors.white_muted,
    borderColor: colors.white_muted,
  }),
  primary: Object.assign({}, $baseStyle, {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  }),
  success: Object.assign({}, $baseStyle, {
    backgroundColor: colors.green,
    borderColor: colors.green,
  }),
  warning: Object.assign({}, $baseStyle, {
    backgroundColor: colors.yellow,
    borderColor: colors.yellow,
  }),
  danger: Object.assign({}, $baseStyle, {
    backgroundColor: colors.red,
    borderColor: colors.red,
  }),
}

export interface TagProps extends BaseViewProps {
  text?: string | number;
  size?: Sizes;
  preset?: Presets;
  color?: ColorTypes;
  wrap?: boolean;
  selectText?: boolean;
  disableTranslate?: boolean;
  borderColor?: string;
  backgroundColor?: string;
}


export function Tag(props: TagProps) {
  const { size, text, wrap, selectText, disableTranslate, style: $styleOverride, ...rest } = props;
  const preset: Presets = props.preset || 'default';

  const $textStyle = Object.assign(
    {},
    $presets[preset],
    size ? $sizeStyles[size] : {},
    wrap ? { overflowWrap: 'anywhere' } : {},
    selectText ? { userSelect: 'text' } : {}
  );
  const $style = Object.assign({}, $textStyle, $styleOverride);
  return (
    <BaseView style={$style} {...rest}>
      {disableTranslate ? <span translate="no">{text}</span> : text}
    </BaseView>
  );
}