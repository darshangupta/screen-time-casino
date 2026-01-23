import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SubscriptionStatus } from '../../../shared/types';

interface SubscriptionState extends SubscriptionStatus {
  isLoading: boolean;
  lastChecked: number;
  offerings: any[];
}

const initialState: SubscriptionState = {
  isSubscribed: false,
  productId: null,
  expirationDate: null,
  renewalDate: null,
  isInGracePeriod: false,
  isTrialing: false,
  isLoading: false,
  lastChecked: 0,
  offerings: [],
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscriptionStatus: (state, action: PayloadAction<SubscriptionStatus>) => {
      state.isSubscribed = action.payload.isSubscribed;
      state.productId = action.payload.productId;
      state.expirationDate = action.payload.expirationDate;
      state.renewalDate = action.payload.renewalDate;
      state.isInGracePeriod = action.payload.isInGracePeriod;
      state.isTrialing = action.payload.isTrialing;
      state.lastChecked = Date.now();
    },
    setOfferings: (state, action: PayloadAction<any[]>) => {
      state.offerings = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearSubscription: (state) => {
      state.isSubscribed = false;
      state.productId = null;
      state.expirationDate = null;
      state.renewalDate = null;
      state.isInGracePeriod = false;
      state.isTrialing = false;
    },
    fixTypeCoercion: (state, action: PayloadAction<Partial<SubscriptionState>>) => {
      // Fix boolean fields that may have been coerced to strings by Redux DevTools
      Object.assign(state, action.payload);
    },
  },
});

export const { 
  setSubscriptionStatus, 
  setOfferings, 
  setLoading, 
  clearSubscription,
  fixTypeCoercion
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;