export type GameType = 
  | 'slots' 
  | 'blackjack' 
  | 'roulette' 
  | 'plinko' 
  | 'pai-gow' 
  | 'math-problems' 
  | 'jewel-mining';

export interface GameConfig {
  winProbability: number;
  lossProbability: number;
  minScreenTimeDelta: number;
  maxScreenTimeDelta: number;
  dailyCap: number;
}

export interface GameOutcome {
  result: 'win' | 'loss' | 'push';
  screenTimeDelta: number;
  displayData: any;
}

export interface GameEngine<TInput, TDisplay> {
  config: GameConfig;
  play(input: TInput, seed: number): GameOutcome & { display: TDisplay };
  validateInput(input: TInput): boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  createdAt: number;
  isSubscribed: boolean;
  subscriptionExpiry?: number;
}

export interface DailyStats {
  date: string;
  totalGamesPlayed: number;
  totalSpinsUsed: number;
  netScreenTimeChange: number;
  winCount: number;
  lossCount: number;
  pushCount: number;
}

export interface AppScreenTime {
  bundleId: string;
  appName: string;
  baselineMinutes: number;
  currentLimit: number;
  todayUsage: number;
  lastModified: number;
}

export interface GameResult {
  id: string;
  timestamp: number;
  gameType: GameType;
  outcome: 'win' | 'loss' | 'push';
  screenTimeDelta: number;
  betAmount: number;
  displayData: any;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  productId: string | null;
  expirationDate: Date | null;
  renewalDate: Date | null;
  isInGracePeriod: boolean;
  isTrialing: boolean;
}