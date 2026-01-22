import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameType, GameOutcome, DailyStats } from '../../../shared/types';

interface CasinoState {
  currentGame: GameType | null;
  sessionActive: boolean;
  lastOutcome: GameOutcome | null;
  dailyStats: DailyStats;
  isLoading: boolean;
}

const initialState: CasinoState = {
  currentGame: null,
  sessionActive: false,
  lastOutcome: null,
  dailyStats: {
    date: new Date().toISOString().split('T')[0],
    totalGamesPlayed: 0,
    totalSpinsUsed: 0,
    netScreenTimeChange: 0,
    winCount: 0,
    lossCount: 0,
    pushCount: 0,
  },
  isLoading: false,
};

const casinoSlice = createSlice({
  name: 'casino',
  initialState,
  reducers: {
    startGame: (state, action: PayloadAction<GameType>) => {
      state.currentGame = action.payload;
      state.sessionActive = true;
      state.isLoading = false;
    },
    endGame: (state) => {
      state.currentGame = null;
      state.sessionActive = false;
      state.isLoading = false;
    },
    setGameOutcome: (state, action: PayloadAction<GameOutcome>) => {
      state.lastOutcome = action.payload;
      
      // Update daily stats
      const today = new Date().toISOString().split('T')[0];
      if (state.dailyStats.date !== today) {
        // Reset stats for new day
        state.dailyStats = {
          date: today,
          totalGamesPlayed: 0,
          totalSpinsUsed: 0,
          netScreenTimeChange: 0,
          winCount: 0,
          lossCount: 0,
          pushCount: 0,
        };
      }
      
      state.dailyStats.totalGamesPlayed++;
      state.dailyStats.totalSpinsUsed++;
      state.dailyStats.netScreenTimeChange += action.payload.screenTimeDelta;
      
      switch (action.payload.result) {
        case 'win':
          state.dailyStats.winCount++;
          break;
        case 'loss':
          state.dailyStats.lossCount++;
          break;
        case 'push':
          state.dailyStats.pushCount++;
          break;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetDailyStats: (state) => {
      const today = new Date().toISOString().split('T')[0];
      state.dailyStats = {
        date: today,
        totalGamesPlayed: 0,
        totalSpinsUsed: 0,
        netScreenTimeChange: 0,
        winCount: 0,
        lossCount: 0,
        pushCount: 0,
      };
    },
  },
});

export const { 
  startGame, 
  endGame, 
  setGameOutcome, 
  setLoading, 
  resetDailyStats 
} = casinoSlice.actions;

export default casinoSlice.reducer;