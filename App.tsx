import React from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/infrastructure/storage/store';
import AppNavigator from './src/presentation/navigation/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="light" backgroundColor="#000000" />
      <AppNavigator />
    </Provider>
  );
}