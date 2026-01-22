import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { RootState } from '../../infrastructure/storage/store';
import { 
  setCurrentLimits, 
  updateAppLimit, 
  setPermissionStatus, 
  setLoading,
  setDailyUsage 
} from '../../infrastructure/storage/slices/screenTimeSlice';
import { ScreenTimeService } from '../../infrastructure/ios-screen-time/ScreenTimeService';

export function useScreenTime() {
  const dispatch = useDispatch();
  const {
    currentLimits,
    dailyUsage,
    isLoading,
    permissionStatus,
    lastSync
  } = useSelector((state: RootState) => state.screenTime);

  const screenTimeService = ScreenTimeService.getInstance();

  const requestPermission = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const granted = await screenTimeService.requestAuthorization();
      const status = granted ? 'granted' : 'denied';
      dispatch(setPermissionStatus(status));
      return granted;
    } catch (error) {
      console.error('Permission request failed:', error);
      dispatch(setPermissionStatus('denied'));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const checkPermission = useCallback(async () => {
    const status = await screenTimeService.checkPermission();
    dispatch(setPermissionStatus(status));
    return status === 'granted';
  }, [dispatch]);

  const syncLimits = useCallback(async () => {
    if (permissionStatus !== 'granted') {
      return false;
    }

    dispatch(setLoading(true));
    try {
      const limits = await screenTimeService.getCurrentLimits();
      dispatch(setCurrentLimits(limits));
      
      const usage = await screenTimeService.getTodayUsage();
      const usageMap = usage.reduce((acc, item) => {
        acc[item.bundleId] = item.usageInMinutes;
        return acc;
      }, {} as Record<string, number>);
      dispatch(setDailyUsage(usageMap));
      
      return true;
    } catch (error) {
      console.error('Failed to sync limits:', error);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, permissionStatus]);

  const updateLimit = useCallback(async (bundleId: string, minutes: number) => {
    if (permissionStatus !== 'granted') {
      return false;
    }

    dispatch(setLoading(true));
    try {
      const success = await screenTimeService.updateAppLimit(bundleId, minutes);
      if (success) {
        dispatch(updateAppLimit({ bundleId, newLimit: minutes }));
      }
      return success;
    } catch (error) {
      console.error('Failed to update limit:', error);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, permissionStatus]);

  const applyGameOutcome = useCallback(async (bundleId: string, screenTimeDelta: number) => {
    if (permissionStatus !== 'granted') {
      return false;
    }

    const app = currentLimits.find(app => app.bundleId === bundleId);
    if (!app) {
      console.error('App not found in current limits');
      return false;
    }

    const newLimit = Math.max(1, Math.min(12 * 60, app.currentLimit + screenTimeDelta));
    return await updateLimit(bundleId, newLimit);
  }, [permissionStatus, currentLimits, updateLimit]);

  const needsSync = useCallback(() => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return lastSync < fiveMinutesAgo;
  }, [lastSync]);

  // Auto-sync on permission change
  useEffect(() => {
    if (permissionStatus === 'granted' && needsSync()) {
      syncLimits();
    }
  }, [permissionStatus, syncLimits, needsSync]);

  return {
    // State
    currentLimits,
    dailyUsage,
    isLoading,
    permissionStatus,
    isPermissionGranted: permissionStatus === 'granted',

    // Actions
    requestPermission,
    checkPermission,
    syncLimits,
    updateLimit,
    applyGameOutcome,
    needsSync,
  };
}