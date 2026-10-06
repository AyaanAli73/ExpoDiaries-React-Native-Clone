import { Platform, TextStyle } from 'react-native';

import { TypographyTokens } from './tokens';

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Typography: Record<keyof typeof TypographyTokens, TextStyle> = {
  display: {
    fontSize: TypographyTokens.display.fontSize,
    lineHeight: TypographyTokens.display.lineHeight,
    fontWeight: TypographyTokens.display.fontWeight,
    letterSpacing: TypographyTokens.display.letterSpacing,
  },
  heading: {
    fontSize: TypographyTokens.heading.fontSize,
    lineHeight: TypographyTokens.heading.lineHeight,
    fontWeight: TypographyTokens.heading.fontWeight,
    letterSpacing: TypographyTokens.heading.letterSpacing,
  },
  title: {
    fontSize: TypographyTokens.title.fontSize,
    lineHeight: TypographyTokens.title.lineHeight,
    fontWeight: TypographyTokens.title.fontWeight,
    letterSpacing: TypographyTokens.title.letterSpacing,
  },
  body: {
    fontSize: TypographyTokens.body.fontSize,
    lineHeight: TypographyTokens.body.lineHeight,
    fontWeight: TypographyTokens.body.fontWeight,
    letterSpacing: TypographyTokens.body.letterSpacing,
  },
  label: {
    fontSize: TypographyTokens.label.fontSize,
    lineHeight: TypographyTokens.label.lineHeight,
    fontWeight: TypographyTokens.label.fontWeight,
    letterSpacing: TypographyTokens.label.letterSpacing,
  },
  caption: {
    fontSize: TypographyTokens.caption.fontSize,
    lineHeight: TypographyTokens.caption.lineHeight,
    fontWeight: TypographyTokens.caption.fontWeight,
    letterSpacing: TypographyTokens.caption.letterSpacing,
  },
};

export const FontSizes = {
  xs: TypographyTokens.caption.fontSize,
  sm: TypographyTokens.label.fontSize,
  base: TypographyTokens.body.fontSize,
  md: 16,
  lg: TypographyTokens.title.fontSize,
  xl: 20,
  '2xl': TypographyTokens.heading.fontSize,
  '3xl': 28,
  '4xl': TypographyTokens.display.fontSize,
} as const;

export const LineHeights = {
  tight: TypographyTokens.label.lineHeight,
  normal: TypographyTokens.body.lineHeight,
  relaxed: TypographyTokens.title.lineHeight,
  heading: TypographyTokens.heading.lineHeight,
  title: TypographyTokens.display.lineHeight,
} as const;

export type TypographyRole = keyof typeof TypographyTokens;
