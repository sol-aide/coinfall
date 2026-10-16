import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Backdrop } from './components/Backdrop';
import { CharmPickScreen } from './screens/CharmPickScreen';
import { DuesScreen } from './screens/DuesScreen';
import { EndScreen } from './screens/EndScreen';
import { GameScreen } from './screens/GameScreen';
import { HowToScreen, MenuOverlay, PrivacyScreen, SettingsScreen } from './screens/InfoScreens';
import { ShopScreen } from './screens/ShopScreen';
import { TitleScreen } from './screens/TitleScreen';
import { useGame } from './state/GameContext';
import { colors } from './theme';

type Route = 'title' | 'game' | 'howto' | 'settings' | 'privacy';

/** Top-level navigation: a tiny state machine. In-run screens follow the run's own screen. */
export function Root() {
  return (
    <View style={styles.fill}>
      <Backdrop />
      <Screens />
    </View>
  );
}

function Screens() {
  const { loaded, run, abandonRun } = useGame();
  const [route, setRoute] = useState<Route>('title');
  const [back, setBack] = useState<Route>('title');
  const [menu, setMenu] = useState(false);

  const go = (to: Route, from: Route) => {
    setBack(from);
    setMenu(false);
    setRoute(to);
  };

  if (!loaded) {
    return (
      <View style={[styles.clear, styles.center]}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (route === 'howto') return <HowToScreen onBack={() => setRoute(back)} />;
  if (route === 'privacy') return <PrivacyScreen onBack={() => setRoute(back === 'privacy' ? 'title' : back)} />;
  if (route === 'settings')
    return (
      <SettingsScreen
        onBack={() => setRoute(back)}
        onPrivacy={() => {
          setRoute('privacy');
          setBack('settings');
        }}
      />
    );

  if (route === 'title' || !run) {
    return (
      <TitleScreen
        onPlay={() => setRoute('game')}
        onHowTo={() => go('howto', 'title')}
        onSettings={() => go('settings', 'title')}
        onPrivacy={() => go('privacy', 'title')}
      />
    );
  }

  const openMenu = () => setMenu(true);
  return (
    <View style={styles.clear}>
      {run.screen === 'pickCharm' && <CharmPickScreen onBack={() => setRoute('title')} />}
      {(run.screen === 'ready' || run.screen === 'reward') && <GameScreen onMenu={openMenu} />}
      {run.screen === 'dues' && <DuesScreen />}
      {run.screen === 'shop' && <ShopScreen onMenu={openMenu} />}
      {(run.screen === 'won' || run.screen === 'lost') && <EndScreen onTitle={() => setRoute('title')} />}
      {menu && (
        <MenuOverlay
          onClose={() => setMenu(false)}
          onHowTo={() => go('howto', 'game')}
          onSettings={() => go('settings', 'game')}
          onTitle={() => go('title', 'title')}
          onAbandon={() => {
            setMenu(false);
            abandonRun();
            setRoute('title');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bgDeep },
  clear: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
});
