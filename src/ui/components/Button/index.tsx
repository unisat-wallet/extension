import React, { CSSProperties, useState } from 'react';

import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';

import { Column } from '../Column';
import { Icon, IconTypes } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';

type Presets = keyof typeof $viewPresets;
export interface ButtonProps {
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string;
  subText?: string;
  /**
   * An optional style override useful for padding & margin.
   */
  style?: CSSProperties;
  /**
   * An optional style override for the "pressed" state.
   */
  pressedStyle?: CSSProperties;
  /**
   * An optional style override for the button text.
   */
  textStyle?: CSSProperties;
  /**
   * An optional style override for the button text when in the "pressed" state.
   */
  pressedTextStyle?: CSSProperties;
  /**
   * One of the different types of button presets.
   */
  preset?: Presets;
  /**
   * An optional component to render on the right side of the text.
   * Example: `RightAccessory={(props) => <View {...props} />}`
   */
  RightAccessory?: React.ReactNode;
  /**
   * An optional component to render on the left side of the text.
   * Example: `LeftAccessory={(props) => <View {...props} />}`
   */
  LeftAccessory?: React.ReactNode;
  /**
   * Children components.
   */
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  icon?: IconTypes;
  iconSize?: {
    width: number;
    height: number;
  };
  disabled?: boolean;
  full?: boolean;
}

const $baseViewStyle: CSSProperties = {
  display: 'flex',
  minHeight: 36,
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'row',
  // paddingVertical: spacing.small,
  // paddingHorizontal: spacing.small,
  overflow: 'hidden',
  cursor: 'pointer',
  alignSelf: 'stretch',
  paddingLeft: spacing.small,
  paddingRight: spacing.small
};

const $viewPresets = {
  default: Object.assign({}, $baseViewStyle, {
    borderWidth: 1,
    minHeight: 50,
    borderColor: colors.white_muted,
    borderRadius: 12
  }) as CSSProperties,

  primary: Object.assign({}, $baseViewStyle, {
    background: 'linear-gradient(103.92deg, #EBB94C 0%, #E97E00 100%)',
    height: '48px'
  } as CSSProperties),

  danger: Object.assign({}, $baseViewStyle, {
    backgroundColor: colors.red,
    height: '48px'
  } as CSSProperties),

  approval: Object.assign({}, $baseViewStyle, {
    backgroundColor: colors.orange,
    height: '48px'
  } as CSSProperties),

  bar: Object.assign({}, $baseViewStyle, {
    backgroundColor: colors.black_dark,
    height: '75px',
    justifyContent: 'space-between',

    paddingTop: spacing.medium,
    paddingBottom: spacing.medium
  } as CSSProperties),

  defaultV2: Object.assign({}, $baseViewStyle, {
    borderWidth: 1,
    minHeight: 50,
    borderColor: colors.white_muted,
    borderRadius: 12
  } as CSSProperties),

  primaryV2: Object.assign({}, $baseViewStyle, {
    background: 'linear-gradient(103.92deg, #EBB94C 0%, #E97E00 100%)',
    minHeight: 50,
    borderRadius: 12
  } as CSSProperties),

  home: Object.assign({}, $baseViewStyle, {
    backgroundColor: colors.black_dark,
    minWidth: 64,
    minHeight: 64,
    flexDirection: 'column',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF4D',
    padding: 5,
    marginRight: 5,
    marginLeft: 5
  }) as CSSProperties,

  minimal: Object.assign({}, $baseViewStyle, {
    backgroundColor: 'rgba(255,124,42,0.1)',
    minWidth: 60,
    height: 20,
    flexDirection: 'column',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,124,42,0.4)',
    padding: 2,
    marginRight: 5,
    marginLeft: 5,
    alignItems: 'center'
  }) as CSSProperties,

  minimal2: Object.assign({}, $baseViewStyle, {
    backgroundColor: 'rgba(255,255,255,0.08)',
    minWidth: 60,
    height: 20,
    flexDirection: 'column',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 2,
    marginRight: 5,
    marginLeft: 5,
    alignItems: 'center'
  }) as CSSProperties
};

const $hoverViewPresets: Record<Presets, CSSProperties> = {
  default: {
    backgroundColor: '#383535'
  },
  primary: {
    backgroundColor: colors.yellow_dark
  },
  approval: {
    backgroundColor: colors.orange_dark
  },
  danger: {
    backgroundColor: colors.red_dark
  },
  bar: {
    backgroundColor: '#383535'
  },
  defaultV2: {},
  primaryV2: {
    backgroundColor: colors.yellow_dark
  },
  home: {
    backgroundColor: '#383535'
  },
  minimal: {
    backgroundColor: 'rgba(255,124,42,0.1)'
  },
  minimal2: {
    backgroundColor: 'rgba(255,255,255,0.08)'
  }
};

const $baseTextStyle: CSSProperties = {
  // fontSize: 16,
  // lineHeight: 20,
  // fontFamily: typography.primary.medium,
  textAlign: 'center',
  flexShrink: 1,
  flexGrow: 0,
  zIndex: 2,
  color: colors.white,
  paddingLeft: spacing.tiny,
  paddingRight: spacing.tiny
};

const $textPresets: Record<Presets, CSSProperties> = {
  default: $baseTextStyle,
  primary: Object.assign({}, $baseTextStyle, { color: colors.black }),
  approval: Object.assign({}, $baseTextStyle, { color: colors.black }),
  danger: Object.assign({}, $baseTextStyle, { color: colors.white }),
  bar: Object.assign({}, $baseTextStyle, { textAlign: 'left', fontWeight: 'bold' } as CSSProperties),

  defaultV2: Object.assign({}, $baseTextStyle, {}),
  primaryV2: Object.assign({}, $baseTextStyle, { color: colors.black }),
  home: Object.assign({}, $baseTextStyle, {
    color: colors.textDim,
    fontSize: 12
  }),
  minimal: Object.assign({}, $baseTextStyle, {
    color: '#FF7C2A',
    fontSize: 12
  }),
  minimal2: Object.assign({}, $baseTextStyle, {
    color: '#FFFFFF',
    fontSize: 12
  })
};

const $rightAccessoryStyle: CSSProperties = { marginLeft: spacing.extraSmall, zIndex: 1 };
const $leftAccessoryStyle: CSSProperties = { marginRight: spacing.extraSmall, zIndex: 1 };
const $baseDisabledViewStyle: CSSProperties = { cursor: 'not-allowed', opacity: 0.5 };
export function Button(props: ButtonProps) {
  const {
    text,
    subText,
    style: $viewStyleOverride,
    pressedStyle: $pressedViewStyleOverride,
    textStyle: $textStyleOverride,
    pressedTextStyle: $pressedTextStyleOverride,
    children,
    RightAccessory,
    LeftAccessory,
    onClick,
    icon,
    iconSize,
    disabled,
    full,
    ...rest
  } = props;

  const preset: Presets = props.preset || 'default';
  const [hover, setHover] = useState(false);
  const $viewStyle = Object.assign(
    {},
    $viewPresets[preset],
    $viewStyleOverride,
    hover && !disabled ? $hoverViewPresets[preset] : {},
    disabled ? $baseDisabledViewStyle : {},
    full ? { flex: 1 } : {}
  );
  const $textStyle = Object.assign({}, $textPresets[preset], $textStyleOverride);

  const $subTextStyle = Object.assign({}, $textPresets[preset], {
    color: colors.white_muted,
    marginTop: 5,
    fontWeight: 'normal'
  } as CSSProperties);
  if (preset === 'bar') {
    return (
      <div
        style={$viewStyle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={disabled ? undefined : onClick}>
        <Row>
          {LeftAccessory && <div style={$leftAccessoryStyle}>{LeftAccessory}</div>}
          {icon && <Icon icon={icon} color={'white'} style={{ marginRight: spacing.tiny }} />}
          <Column justifyCenter gap="zero">
            {text && <Text text={text} style={$textStyle} />}
            {subText && <Text text={subText} style={$subTextStyle} />}
          </Column>

          {children}
        </Row>

        {RightAccessory && <div style={$rightAccessoryStyle}>{RightAccessory}</div>}
      </div>
    );
  }

  if (preset === 'home') {
    if (disabled) {
      $viewStyle.backgroundColor = 'rgba(255,255,255,0.15)';
    }
    return (
      <div
        style={$viewStyle}
        onClick={disabled ? undefined : onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        {icon && (
          <Icon
            icon={icon}
            style={Object.assign(
              { marginRight: spacing.tiny, backgroundColor: colors.white },
              iconSize ? iconSize : {}
            )}
            containerStyle={iconSize ? iconSize : {}}
          />
        )}
        {text && <Text style={$textStyle} text={text} preset="regular" mt="sm" color={'white'} />}
      </div>
    );
  }

  if (preset === 'minimal' || preset === 'minimal2') {
    return (
      <div
        style={$viewStyle}
        onClick={disabled ? undefined : onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        {text && <Text style={$textStyle} text={text} preset="regular" />}
      </div>
    );
  }

  return (
    <div
      style={$viewStyle}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      {LeftAccessory && <div style={$leftAccessoryStyle}>{LeftAccessory}</div>}
      {icon && <Icon icon={icon} style={{ marginRight: spacing.tiny, backgroundColor: $textStyle.color }} />}
      {text && <Text style={$textStyle} text={text} preset="regular-bold" />}
      {children}
      {RightAccessory && <div style={$rightAccessoryStyle}>{RightAccessory}</div>}
    </div>
  );
}
