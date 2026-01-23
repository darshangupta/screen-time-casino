/**
 * Environment configuration for Screen Time Casino
 * Reads from .env files and provides runtime configuration
 */

// Helper function to parse boolean environment variables
const parseBool = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

// Helper function to parse number environment variables
const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Environment detection
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;
export const environment = process.env.EXPO_PUBLIC_ENVIRONMENT || (isDevelopment ? 'development' : 'production');

console.log(`🎰 CASINO ENVIRONMENT: ${environment.toUpperCase()}`);

// Casino Configuration from Environment Variables
export const CONFIG = {
  // Environment
  isDevelopment,
  isProduction,
  environment,
  
  // Spins configuration
  unlimitedSpins: parseBool(process.env.EXPO_PUBLIC_UNLIMITED_SPINS, isDevelopment),
  dailySpinsFree: parseNumber(process.env.EXPO_PUBLIC_DEV_SPINS_PER_DAY, 3),
  dailySpinsPremium: parseNumber(process.env.EXPO_PUBLIC_DEV_SPINS_PER_DAY, 10),
  
  // Game access
  unlockAllGames: parseBool(process.env.EXPO_PUBLIC_UNLOCK_ALL_GAMES, isDevelopment),
  bypassSubscription: parseBool(process.env.EXPO_PUBLIC_BYPASS_SUBSCRIPTION, isDevelopment),
  
  // Testing & debugging features
  showDebugInfo: parseBool(process.env.EXPO_PUBLIC_SHOW_DEBUG_INFO, isDevelopment),
  enableTestButtons: parseBool(process.env.EXPO_PUBLIC_ENABLE_TEST_BUTTONS, isDevelopment),
  skipAnimations: parseBool(process.env.EXPO_PUBLIC_SKIP_ANIMATIONS, false),
  
  // Casino mechanics testing
  guaranteedWins: parseBool(process.env.EXPO_PUBLIC_GUARANTEED_WINS, false),
  guaranteedLosses: parseBool(process.env.EXPO_PUBLIC_GUARANTEED_LOSSES, false),
  showGameDebug: parseBool(process.env.EXPO_PUBLIC_SHOW_GAME_DEBUG, false),
  
  // Screen Time API
  mockScreenTimeAPI: parseBool(process.env.EXPO_PUBLIC_MOCK_SCREEN_TIME_API, true),
  allowNegativeScreenTime: parseBool(process.env.EXPO_PUBLIC_ALLOW_NEGATIVE_SCREEN_TIME, isDevelopment),
  
  // Screen time limits (minutes)
  minScreenTime: parseNumber(process.env.EXPO_PUBLIC_MIN_SCREEN_TIME, 30),
  maxScreenTime: parseNumber(process.env.EXPO_PUBLIC_MAX_SCREEN_TIME, 720), // 12 hours
  
  // Subscription
  subscriptionPrice: process.env.EXPO_PUBLIC_SUBSCRIPTION_PRICE || '2.99',
  revenueCatApiKey: process.env.EXPO_PUBLIC_REVENUE_CAT_API_KEY || '',
};

// Development logging
if (CONFIG.showDebugInfo) {
  console.log('🎰 CASINO CONFIG LOADED:', {
    environment: CONFIG.environment,
    unlimitedSpins: CONFIG.unlimitedSpins,
    dailySpinsFree: CONFIG.dailySpinsFree,
    dailySpinsPremium: CONFIG.dailySpinsPremium,
    unlockAllGames: CONFIG.unlockAllGames,
    bypassSubscription: CONFIG.bypassSubscription,
    showDebugInfo: CONFIG.showDebugInfo,
    enableTestButtons: CONFIG.enableTestButtons,
  });
}