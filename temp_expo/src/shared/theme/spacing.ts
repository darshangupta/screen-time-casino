// Consistent spacing system for the casino app
export const Spacing = {
  // Base spacing units
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // Screen margins
  screenHorizontal: 20,
  screenVertical: 24,
  
  // Component spacing
  cardPadding: 16,
  buttonPadding: 12,
  inputPadding: 16,
  
  // Game grid spacing
  gameCardMargin: 8,
  gameCardPadding: 12,
  
  // Layout spacing
  sectionSpacing: 32,
  itemSpacing: 16,
  inlineSpacing: 8,
  
  // Safe area adjustments
  safeAreaTop: 20,
  safeAreaBottom: 34, // For devices with home indicator
  
  // Border radius
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 24,
    round: 999, // For circular elements
  },
  
  // Icon sizes
  iconSize: {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  },
} as const;