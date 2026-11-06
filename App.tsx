import { Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Root } from './src/ui/Root';
import { GameProvider } from './src/ui/state/GameContext';
import { colors } from './src/ui/theme';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold });
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: colors.bgDeep }} />;
  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="light" />
        <Root />
      </GameProvider>
    </SafeAreaProvider>
  );
}
