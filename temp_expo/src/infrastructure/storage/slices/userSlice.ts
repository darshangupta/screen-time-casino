import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, GameResult } from '../../../shared/types';

interface UserState {
  profile: UserProfile | null;
  gameHistory: GameResult[];
  isAuthenticated: boolean;
  isLoading: boolean;
  preferences: {
    soundEnabled: boolean;
    vibrationsEnabled: boolean;
    darkModeEnabled: boolean;
  };
}

const initialState: UserState = {
  profile: null,
  gameHistory: [],
  isAuthenticated: false,
  isLoading: false,
  preferences: {
    soundEnabled: true,
    vibrationsEnabled: true,
    darkModeEnabled: false,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.isAuthenticated = true;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.isAuthenticated = false;
      state.gameHistory = [];
    },
    addGameResult: (state, action: PayloadAction<GameResult>) => {
      state.gameHistory.unshift(action.payload);
      // Keep only last 100 games
      if (state.gameHistory.length > 100) {
        state.gameHistory = state.gameHistory.slice(0, 100);
      }
    },
    setGameHistory: (state, action: PayloadAction<GameResult[]>) => {
      state.gameHistory = action.payload;
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateSubscriptionStatus: (state, action: PayloadAction<{ isSubscribed: boolean; subscriptionExpiry?: number }>) => {
      if (state.profile) {
        state.profile.isSubscribed = action.payload.isSubscribed;
        state.profile.subscriptionExpiry = action.payload.subscriptionExpiry;
      }
    },
  },
});

export const { 
  setProfile, 
  clearProfile, 
  addGameResult, 
  setGameHistory, 
  updatePreferences, 
  setLoading,
  updateSubscriptionStatus 
} = userSlice.actions;

export default userSlice.reducer;