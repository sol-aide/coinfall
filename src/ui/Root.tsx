import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { CharmPickScreen } from './screens/CharmPickScreen';
import { GameScreen } from './screens/GameScreen';
import { TitleScreen } from './screens/TitleScreen';
import { useGame } from './state/GameContext';
import { colors } from './theme';

type Route = 'title' | 'game';

/** Top-level navigation: a tiny state machine driven by the run's screen. */
export function Root() {
  const { loaded, run } = useGame();
  const [route, setRoute] = useState<Route>('title');

  if (!loaded) {
    return (
      <View style={[styles.fill, styles.center]}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (route === 'title' || !run) {
    return (
      <View style={styles.fill}>
        <TitleScreen onPlay={() => setRoute('game')} onHowTo={() => {}} onSettings={() => {}} onPrivacy={() => {}} />
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      {run.screen === 'pickCharm' && <CharmPickScreen onBack={() => setRoute('title')} />}
      {(run.screen === 'ready' || run.screen === 'reward') && <GameScreen onMenu={() => setRoute('title')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
});
