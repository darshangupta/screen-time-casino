// Casino-themed color palette
export const Colors = {
  // Core Casino Colors
  black: '#000000',
  darkBackground: '#0A0A0A',
  cardBackground: '#1C1C1E',
  modalBackground: '#2C2C2E',
  
  // Gold Accents
  gold: '#FFD700',
  darkGold: '#B8860B',
  lightGold: '#FFF8DC',
  
  // Casino Reds
  red: '#DC143C',
  darkRed: '#8B0000',
  lightRed: '#FF6B6B',
  
  // Neon Colors
  neonBlue: '#00BFFF',
  neonGreen: '#39FF14',
  neonPurple: '#BF00FF',
  neonPink: '#FF1493',
  neonOrange: '#FF4500',
  
  // Neutral Grays
  lightGray: '#E5E5E7',
  gray: '#8E8E93',
  darkGray: '#636366',
  veryDarkGray: '#48484A',
  
  // Status Colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  // Text Colors
  primaryText: '#FFFFFF',
  secondaryText: '#8E8E93',
  tertiaryText: '#636366',
  
  // Game-specific Colors
  slots: {
    primary: '#FF1493',
    secondary: '#8B008B',
    accent: '#FFD700',
  },
  blackjack: {
    primary: '#DC143C',
    secondary: '#8B0000',
    accent: '#FFD700',
  },
  roulette: {
    primary: '#228B22',
    secondary: '#006400',
    accent: '#FFD700',
  },
  plinko: {
    primary: '#00BFFF',
    secondary: '#4682B4',
    accent: '#FFD700',
  },
  paigow: {
    primary: '#BF00FF',
    secondary: '#8B008B',
    accent: '#FFD700',
  },
  math: {
    primary: '#FF4500',
    secondary: '#FF6347',
    accent: '#FFD700',
  },
  jewels: {
    primary: '#39FF14',
    secondary: '#32CD32',
    accent: '#FFD700',
  },
} as const;

export type ColorName = keyof typeof Colors;