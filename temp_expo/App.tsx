import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/infrastructure/storage/store';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import { Colors } from './src/shared/theme';

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="light" backgroundColor={Colors.black} />
      <AppNavigator />
    </Provider>
  );
}
