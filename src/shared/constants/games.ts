import { GameType } from '../types';

// TEMPORARILY UNLOCK ALL GAMES FOR TESTING
export const FREE_GAMES: GameType[] = ['slots', 'blackjack', 'roulette', 'plinko', 'pai-gow', 'math-problems', 'jewel-mining'];
export const PAID_GAMES: GameType[] = [];
// TODO: Restore original game distribution after testing:
// export const FREE_GAMES: GameType[] = ['slots', 'blackjack', 'roulette'];
// export const PAID_GAMES: GameType[] = ['plinko', 'pai-gow', 'math-problems', 'jewel-mining'];

export const DAILY_SPINS_FREE = 3;
export const DAILY_SPINS_PREMIUM = 10;

export const SUBSCRIPTION_PRICE = '$2.99';
export const SUBSCRIPTION_PRODUCT_ID = 'screen_time_casino_premium_monthly';

export const MIN_SCREEN_TIME_MINUTES = 30;
export const MAX_SCREEN_TIME_MINUTES = 12 * 60; // 12 hours

export const GAME_CONFIG = {
  slots: {
    winProbability: 0.10,
    lossProbability: 0.85,
    minScreenTimeDelta: 5,
    maxScreenTimeDelta: 60,
    dailyCap: 120
  },
  blackjack: {
    winProbability: 0.42,
    lossProbability: 0.49,
    minScreenTimeDelta: 10,
    maxScreenTimeDelta: 45,
    dailyCap: 90
  },
  roulette: {
    winProbability: 0.47,
    lossProbability: 0.53,
    minScreenTimeDelta: 5,
    maxScreenTimeDelta: 120,
    dailyCap: 180
  },
  plinko: {
    winProbability: 0.35,
    lossProbability: 0.65,
    minScreenTimeDelta: 10,
    maxScreenTimeDelta: 80,
    dailyCap: 150
  },
  'pai-gow': {
    winProbability: 0.40,
    lossProbability: 0.45,
    minScreenTimeDelta: 15,
    maxScreenTimeDelta: 60,
    dailyCap: 120
  },
  'math-problems': {
    winProbability: 0.60,
    lossProbability: 0.40,
    minScreenTimeDelta: 5,
    maxScreenTimeDelta: 30,
    dailyCap: 90
  },
  'jewel-mining': {
    winProbability: 0.25,
    lossProbability: 0.75,
    minScreenTimeDelta: 10,
    maxScreenTimeDelta: 100,
    dailyCap: 200
  }
} as const;