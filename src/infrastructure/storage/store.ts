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
  
  // Fix user boolean fields
  if (state.user && typeof state.user.isAuthenticated === 'string') {
    console.warn('🚨 TYPE COERCION DETECTED: Fixing user.isAuthenticated type from string to boolean');
    store.dispatch({
      type: 'user/fixTypeCoercion',
      payload: { isAuthenticated: state.user.isAuthenticated === 'true' }
    });
  }
  
  // Fix subscription boolean fields
  if (state.subscription) {
    let needsSubscriptionFix = false;
    const subscriptionFixes: any = {};
    
    if (typeof state.subscription.isSubscribed === 'string') {
      console.warn('🚨 TYPE COERCION DETECTED: Fixing subscription.isSubscribed type from string to boolean');
      subscriptionFixes.isSubscribed = state.subscription.isSubscribed === 'true';
      needsSubscriptionFix = true;
    }
    
    if (typeof state.subscription.isInGracePeriod === 'string') {
      console.warn('🚨 TYPE COERCION DETECTED: Fixing subscription.isInGracePeriod type from string to boolean');
      subscriptionFixes.isInGracePeriod = state.subscription.isInGracePeriod === 'true';
      needsSubscriptionFix = true;
    }
    
    if (typeof state.subscription.isTrialing === 'string') {
      console.warn('🚨 TYPE COERCION DETECTED: Fixing subscription.isTrialing type from string to boolean');
      subscriptionFixes.isTrialing = state.subscription.isTrialing === 'true';
      needsSubscriptionFix = true;
    }
    
    if (typeof state.subscription.isLoading === 'string') {
      console.warn('🚨 TYPE COERCION DETECTED: Fixing subscription.isLoading type from string to boolean');
      subscriptionFixes.isLoading = state.subscription.isLoading === 'true';
      needsSubscriptionFix = true;
    }
    
    if (needsSubscriptionFix) {
      store.dispatch({
        type: 'subscription/fixTypeCoercion',
        payload: subscriptionFixes
      });
    }
  }
  
  // Fix casino boolean fields
  if (state.casino) {
    let needsCasinoFix = false;
    const casinoFixes: any = {};
    
    if (typeof state.casino.sessionActive === 'string') {
      console.warn('🚨 TYPE COERCION DETECTED: Fixing casino.sessionActive type from string to boolean');
      casinoFixes.sessionActive = state.casino.sessionActive === 'true';
      needsCasinoFix = true;
    }
    
    if (typeof state.casino.isLoading === 'string') {
      console.warn('🚨 TYPE COERCION DETECTED: Fixing casino.isLoading type from string to boolean');
      casinoFixes.isLoading = state.casino.isLoading === 'true';
      needsCasinoFix = true;
    }
    
    if (needsCasinoFix) {
      store.dispatch({
        type: 'casino/fixTypeCoercion',
        payload: casinoFixes
      });
    }
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