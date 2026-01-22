import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DAILY_SPINS_FREE, DAILY_SPINS_PREMIUM } from '../../../shared/constants/games';

interface DailyLimitsState {
  spinsRemaining: number;
  gamesPlayedToday: number;
  lastResetDate: string;
  isLoading: boolean;
}

const today = new Date().toISOString().split('T')[0];

const initialState: DailyLimitsState = {
  spinsRemaining: DAILY_SPINS_FREE,
  gamesPlayedToday: 0,
  lastResetDate: today,
  isLoading: false,
};

const dailyLimitsSlice = createSlice({
  name: 'dailyLimits',
  initialState,
  reducers: {
    useSpins: (state, action: PayloadAction<number>) => {
      const spinsToUse = Math.min(action.payload, state.spinsRemaining);
      state.spinsRemaining -= spinsToUse;
      state.gamesPlayedToday += spinsToUse;
      
      // Check if we need to reset for a new day
      const currentDate = new Date().toISOString().split('T')[0];
      if (currentDate !== state.lastResetDate) {
        dailyLimitsSlice.caseReducers.resetDaily(state, { payload: false, type: 'resetDaily' });
      }
    },
    resetDaily: (state, action: PayloadAction<boolean>) => {
      const isSubscribed = action.payload;
      const currentDate = new Date().toISOString().split('T')[0];
      
      state.spinsRemaining = isSubscribed ? DAILY_SPINS_PREMIUM : DAILY_SPINS_FREE;
      state.gamesPlayedToday = 0;
      state.lastResetDate = currentDate;
    },
    updateSpinsForSubscription: (state, action: PayloadAction<boolean>) => {
      const isSubscribed = action.payload;
      const maxSpins = isSubscribed ? DAILY_SPINS_PREMIUM : DAILY_SPINS_FREE;
      
      // If upgrading to premium, add the difference
      if (isSubscribed && state.spinsRemaining < maxSpins) {
        const currentMax = DAILY_SPINS_FREE;
        const usedSpins = currentMax - state.spinsRemaining;
        state.spinsRemaining = maxSpins - usedSpins;
      }
      // If downgrading, cap at free tier max
      else if (!isSubscribed && state.spinsRemaining > DAILY_SPINS_FREE) {
        state.spinsRemaining = DAILY_SPINS_FREE;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    checkAndResetIfNewDay: (state, action: PayloadAction<boolean>) => {
      const currentDate = new Date().toISOString().split('T')[0];
      if (currentDate !== state.lastResetDate) {
        dailyLimitsSlice.caseReducers.resetDaily(state, { payload: action.payload, type: 'resetDaily' });
      }
    },
  },
});

export const { 
  useSpins, 
  resetDaily, 
  updateSpinsForSubscription, 
  setLoading, 
  checkAndResetIfNewDay 
} = dailyLimitsSlice.actions;

export default dailyLimitsSlice.reducer;