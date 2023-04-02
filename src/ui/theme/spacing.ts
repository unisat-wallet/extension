/**
  Use these spacings for margins/paddings and other whitespace throughout your app.
 */
export const spacing = {
  micro: 2,
  tiny: 4,
  extraSmall: 8,
  small: 12,
  medium: 16,
  large: 24,
  extraLarge: 32,
  huge: 48,
  massive: 64
} as const;

export const spacingGap = {
  xxl: 40,
  xl: 20,
  lg: 12,
  md: 8,
  sm: 4,
  zero: 0
};

export const sizes = {
  qrcode: 180
};

export type Size = keyof typeof sizes;

export type Gap = keyof typeof spacingGap;

export type Spacing = keyof typeof spacing;
