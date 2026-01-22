import React from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/infrastructure/storage/store';
import AppNavigator from './src/presentation/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar style="light" backgroundColor="#000000" />
        <AppNavigator />
      </Provider>
    </SafeAreaProvider>
  );
}