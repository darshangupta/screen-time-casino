import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppScreenTime } from '../../../shared/types';

interface ScreenTimeState {
  currentLimits: AppScreenTime[];
  dailyUsage: Record<string, number>;
  lastSync: number;
  isLoading: boolean;
  permissionStatus: 'granted' | 'denied' | 'not_determined';
}

const initialState: ScreenTimeState = {
  currentLimits: [],
  dailyUsage: {},
  lastSync: 0,
  isLoading: false,
  permissionStatus: 'not_determined',
};

const screenTimeSlice = createSlice({
  name: 'screenTime',
  initialState,
  reducers: {
    setCurrentLimits: (state, action: PayloadAction<AppScreenTime[]>) => {
      state.currentLimits = action.payload;
      state.lastSync = Date.now();
    },
    updateAppLimit: (state, action: PayloadAction<{ bundleId: string; newLimit: number }>) => {
      const app = state.currentLimits.find(app => app.bundleId === action.payload.bundleId);
      if (app) {
        app.currentLimit = action.payload.newLimit;
        app.lastModified = Date.now();
      }
    },
    setDailyUsage: (state, action: PayloadAction<Record<string, number>>) => {
      state.dailyUsage = action.payload;
    },
    updateDailyUsage: (state, action: PayloadAction<{ bundleId: string; usage: number }>) => {
      state.dailyUsage[action.payload.bundleId] = action.payload.usage;
    },
    setPermissionStatus: (state, action: PayloadAction<ScreenTimeState['permissionStatus']>) => {
      state.permissionStatus = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    addApp: (state, action: PayloadAction<AppScreenTime>) => {
      const existingIndex = state.currentLimits.findIndex(app => app.bundleId === action.payload.bundleId);
      if (existingIndex >= 0) {
        state.currentLimits[existingIndex] = action.payload;
      } else {
        state.currentLimits.push(action.payload);
      }
    },
    removeApp: (state, action: PayloadAction<string>) => {
      state.currentLimits = state.currentLimits.filter(app => app.bundleId !== action.payload);
    },
  },
});

export const { 
  setCurrentLimits, 
  updateAppLimit, 
  setDailyUsage, 
  updateDailyUsage, 
  setPermissionStatus, 
  setLoading,
  addApp,
  removeApp 
} = screenTimeSlice.actions;

export default screenTimeSlice.reducer;