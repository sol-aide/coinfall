import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Root } from './src/ui/Root';
import { GameProvider } from './src/ui/state/GameContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="light" />
        <Root />
      </GameProvider>
    </SafeAreaProvider>
  );
}
