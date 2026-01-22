import { configureStore } from '@reduxjs/toolkit';
import casinoSlice from './slices/casinoSlice';
import userSlice from './slices/userSlice';
import screenTimeSlice from './slices/screenTimeSlice';
import subscriptionSlice from './slices/subscriptionSlice';
import dailyLimitsSlice from './slices/dailyLimitsSlice';

// Type guard middleware to fix boolean/string coercion from Redux DevTools persistence
const typeGuardMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  
  // After any state change, ensure types are correct
  const state = store.getState();
  if (state.user && typeof state.user.isAuthenticated === 'string') {
    console.warn('🚨 TYPE COERCION DETECTED: Fixing isAuthenticated type from string to boolean');
    store.dispatch({
      type: 'user/fixTypeCoercion',
      payload: { isAuthenticated: state.user.isAuthenticated === 'true' }
    });
  }
  
  return result;
};

export const store = configureStore({
  reducer: {
    casino: casinoSlice,
    user: userSlice,
    screenTime: screenTimeSlice,
    subscription: subscriptionSlice,
    dailyLimits: dailyLimitsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(typeGuardMiddleware),
  devTools: process.env.NODE_ENV !== 'production' ? {
    // Prevent Redux DevTools from auto-persisting to AsyncStorage
    shouldHotReload: false,
    shouldRecordChanges: true,
    shouldStartLocked: false,
  } : false,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;