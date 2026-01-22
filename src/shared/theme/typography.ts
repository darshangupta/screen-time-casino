import { TextStyle } from 'react-native';
import { Colors } from './colors';

export const Typography = {
  // Casino-style headings
  casinoTitle: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.gold,
    textAlign: 'center' as const,
    letterSpacing: 2,
    textShadowColor: Colors.darkGold,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  } as TextStyle,
  
  casinoSubtitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.lightGold,
    textAlign: 'center' as const,
    letterSpacing: 1.5,
  } as TextStyle,
  
  // Screen headers
  screenTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.primaryText,
    letterSpacing: 1,
  } as TextStyle,
  
  screenSubtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.secondaryText,
    letterSpacing: 0.5,
  } as TextStyle,
  
  // Game text styles
  gameTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primaryText,
    textAlign: 'center' as const,
    letterSpacing: 1,
  } as TextStyle,
  
  gameSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.secondaryText,
    textAlign: 'center' as const,
  } as TextStyle,
  
  // Button text styles
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.black,
    textAlign: 'center' as const,
    letterSpacing: 0.5,
  } as TextStyle,
  
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.gold,
    textAlign: 'center' as const,
    letterSpacing: 0.5,
  } as TextStyle,
  
  // Body text
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400' as const,
    color: Colors.primaryText,
    lineHeight: 24,
  } as TextStyle,
  
  bodyMedium: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.primaryText,
    lineHeight: 22,
  } as TextStyle,
  
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.secondaryText,
    lineHeight: 18,
  } as TextStyle,
  
  // Caption and labels
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.tertiaryText,
    letterSpacing: 0.5,
  } as TextStyle,
  
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primaryText,
    letterSpacing: 0.25,
  } as TextStyle,
  
  // Status text
  successText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.success,
    textAlign: 'center' as const,
  } as TextStyle,
  
  errorText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.error,
    textAlign: 'center' as const,
  } as TextStyle,
  
  warningText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.warning,
    textAlign: 'center' as const,
  } as TextStyle,
  
  // Special casino text effects
  neonText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.neonBlue,
    textAlign: 'center' as const,
    textShadowColor: Colors.neonBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  } as TextStyle,
  
  glowText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.gold,
    textAlign: 'center' as const,
    textShadowColor: Colors.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  } as TextStyle,
} as const;