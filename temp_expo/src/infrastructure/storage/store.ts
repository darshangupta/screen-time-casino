import { configureStore } from '@reduxjs/toolkit';
import casinoSlice from './slices/casinoSlice';
import userSlice from './slices/userSlice';
import screenTimeSlice from './slices/screenTimeSlice';
import subscriptionSlice from './slices/subscriptionSlice';
import dailyLimitsSlice from './slices/dailyLimitsSlice';

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
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;