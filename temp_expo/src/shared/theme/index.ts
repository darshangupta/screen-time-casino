export * from './colors';
export * from './typography';
export * from './spacing';

import { Colors } from './colors';
import { Typography } from './typography';
import { Spacing } from './spacing';

// Comprehensive theme object
export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
} as const;

export type ThemeType = typeof Theme;