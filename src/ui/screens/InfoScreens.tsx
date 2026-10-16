import Constants from 'expo-constants';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHARMS, COINS, ENGRAVINGS } from '../../engine';
import { CoinArt } from '../art/CoinArt';
import { Icon } from '../art/Icons';
import { CoinRow } from '../components/CoinInfo';
import { Button, Overlay, Panel, Ribbon, Stitch, Txt } from '../components/ui';
import { HOW_TO_PLAY, PRIVACY_TEXT, TUTORIAL_STEPS } from '../content/text';
import { useGame, type Speed } from '../state/GameContext';
import { TOUCH, colors, font, radius } from '../theme';

function Page({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.head}>
        <Ribbon title={title} width={190} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>{children}</ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button label="Back" variant="secondary" onPress={onBack} testID="back" />
      </View>
    </View>
  );
}

export function HowToScreen({ onBack }: { onBack: () => void }) {
  return (
    <Page title="How to play" onBack={onBack}>
      <View style={styles.coinRow}>
        <CoinArt defId="merchant" size={56} />
        <CoinArt defId="berserker" size={56} />
        <CoinArt defId="moonpriestess" size={56} />
        <CoinArt defId="copper" face="tails" size={56} />
      </View>
      {HOW_TO_PLAY.map((s) => (
        <Panel key={s.title} style={{ gap: 6 }}>
          <Txt style={styles.h2} accessibilityRole="header">
            {s.title}
          </Txt>
          {s.body.map((b, i) => (
            <Txt key={i} style={styles.p}>
              {b}
            </Txt>
          ))}
        </Panel>
      ))}
      <Txt style={[styles.h2, { marginTop: 8 }]} accessibilityRole="header">
        Coin guide
      </Txt>
      {COINS.map((c) => (
        <CoinRow key={c.id} defId={c.id} />
      ))}
      <Txt style={[styles.h2, { marginTop: 8 }]} accessibilityRole="header">
        Charms
      </Txt>
      {CHARMS.map((c) => (
        <View key={c.id} style={styles.guideRow} accessible accessibilityLabel={`${c.name}. ${c.text}`}>
          <Stitch r={radius.md} inset={4} opacity={0.35} />
          <Icon name="charm" size={30} />
          <View style={{ flex: 1 }}>
            <Txt style={styles.guideName}>
              {c.name}
              {c.starter ? <Txt style={styles.note}>  starting charm</Txt> : null}
            </Txt>
            <Txt style={styles.guideText}>{c.text}</Txt>
          </View>
        </View>
      ))}
      <Txt style={[styles.h2, { marginTop: 8 }]} accessibilityRole="header">
        Engravings
      </Txt>
      {ENGRAVINGS.map((e) => (
        <View key={e.id} style={styles.guideRow} accessible accessibilityLabel={`${e.name}. ${e.text}`}>
          <Stitch r={radius.md} inset={4} opacity={0.35} />
          <Icon name="engraving" size={30} />
          <View style={{ flex: 1 }}>
            <Txt style={styles.guideName}>{e.name}</Txt>
            <Txt style={styles.guideText}>{e.text}</Txt>
          </View>
        </View>
      ))}
    </Page>
  );
}

export function PrivacyScreen({ onBack }: { onBack: () => void }) {
  return (
    <Page title="Privacy" onBack={onBack}>
      <Panel style={{ gap: 10 }}>
        {PRIVACY_TEXT.map((p, i) => (
          <Txt key={i} style={styles.p}>
            {p}
          </Txt>
        ))}
      </Panel>
    </Page>
  );
}

const SPEEDS: { value: Speed; label: string }[] = [
  { value: 1, label: 'Normal' },
  { value: 2, label: 'Fast' },
  { value: 4, label: 'Turbo' },
];

export function SettingsScreen({ onBack, onPrivacy }: { onBack: () => void; onPrivacy: () => void }) {
  const { settings, updateSettings, reduceMotion, deleteAllData } = useGame();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const version = Constants.expoConfig?.version ?? '1.0.0';
  return (
    <Page title="Settings" onBack={onBack}>
      <Panel style={{ gap: 10 }}>
        <Txt style={styles.h2}>Animation speed</Txt>
        <View style={styles.segment} accessibilityRole="radiogroup">
          {SPEEDS.map((s) => {
            const on = settings.speed === s.value;
            return (
              <Pressable
                key={s.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`${s.label} animation speed`}
                onPress={() => updateSettings({ speed: s.value })}
                style={[styles.segBtn, on && styles.segOn]}
                testID={`speed-${s.value}`}
              >
                <Txt style={[styles.segTxt, on && { color: '#2A1300' }]}>{s.label}</Txt>
              </Pressable>
            );
          })}
        </View>
        <Txt style={styles.note}>
          {reduceMotion
            ? 'Reduce Motion is on: coins fade in place instead of flying and spinning.'
            : 'Coinfall follows your device’s Reduce Motion setting.'}
        </Txt>
      </Panel>
      <Panel>
        <View style={styles.toggleRow}>
          <Txt style={[styles.h2, { flex: 1 }]}>Haptics</Txt>
          <Switch
            value={settings.haptics}
            onValueChange={(v) => updateSettings({ haptics: v })}
            accessibilityLabel="Haptics"
            trackColor={{ true: colors.accent, false: colors.panelLight }}
          />
        </View>
      </Panel>
      <Panel style={{ gap: 10 }}>
        <Button label="Show the tutorial again" variant="secondary" onPress={() => updateSettings({ tutorialSeen: false })} testID="reset-tutorial" />
        <Button label="Privacy" variant="secondary" onPress={onPrivacy} />
      </Panel>
      <Panel style={{ gap: 8 }}>
        {deleted ? (
          <Txt style={styles.note}>All saved data on this device was deleted.</Txt>
        ) : confirmDelete ? (
          <>
            <Txt style={[styles.note, { color: colors.danger }]}>
              Delete your current run, settings and records from this device? This can’t be undone.
            </Txt>
            <View style={styles.row}>
              <Button label="Cancel" variant="secondary" onPress={() => setConfirmDelete(false)} style={{ flex: 1 }} />
              <Button
                label="Delete"
                variant="danger"
                onPress={() => {
                  deleteAllData();
                  setDeleted(true);
                }}
                style={{ flex: 1 }}
                testID="delete-confirm"
              />
            </View>
          </>
        ) : (
          <Button label="Delete all saved data" variant="ghost" onPress={() => setConfirmDelete(true)} testID="delete-data" />
        )}
      </Panel>
      <Txt style={[styles.note, { textAlign: 'center' }]}>Coinfall {version} · Play money only · No ads · No tracking</Txt>
    </Page>
  );
}

/** First-run tutorial cards shown over the table. */
export function Tutorial({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const step = TUTORIAL_STEPS[i];
  const last = i === TUTORIAL_STEPS.length - 1;
  return (
    <Overlay title={step.title}>
      <Txt style={[styles.p, { fontSize: font.body + 1, lineHeight: 25 }]}>{step.body}</Txt>
      <View style={styles.dots}>
        {TUTORIAL_STEPS.map((_, k) => (
          <View key={k} style={[styles.dot, k === i && styles.dotOn]} />
        ))}
      </View>
      <View style={styles.row}>
        <Button label="Skip tutorial" variant="ghost" onPress={onDone} style={{ flex: 1 }} testID="tutorial-skip" />
        <Button
          label={last ? 'Start playing' : 'Next'}
          variant="gold"
          onPress={() => (last ? onDone() : setI(i + 1))}
          style={{ flex: 1 }}
          testID="tutorial-next"
        />
      </View>
    </Overlay>
  );
}

export function MenuOverlay({
  onClose,
  onSettings,
  onHowTo,
  onTitle,
  onAbandon,
}: {
  onClose: () => void;
  onSettings: () => void;
  onHowTo: () => void;
  onTitle: () => void;
  onAbandon: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <Overlay title="Menu" onClose={onClose}>
      <View style={{ gap: 10 }}>
        <Button label="Resume" variant="gold" onPress={onClose} testID="menu-resume" />
        <Button label="How to play" variant="secondary" onPress={onHowTo} testID="menu-howto" />
        <Button label="Settings" variant="secondary" onPress={onSettings} testID="menu-settings" />
        <Button label="Save and go to title" variant="secondary" onPress={onTitle} testID="menu-title" />
        {confirm ? (
          <View style={{ gap: 6 }}>
            <Txt style={[styles.note, { color: colors.danger, textAlign: 'center' }]}>Abandon this run? This can’t be undone.</Txt>
            <View style={styles.row}>
              <Button label="Keep playing" variant="secondary" onPress={() => setConfirm(false)} style={{ flex: 1 }} />
              <Button label="Abandon" variant="danger" onPress={onAbandon} style={{ flex: 1 }} testID="menu-abandon-confirm" />
            </View>
          </View>
        ) : (
          <Button label="Abandon run" variant="ghost" onPress={() => setConfirm(true)} testID="menu-abandon" />
        )}
      </View>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  head: { paddingHorizontal: 16, paddingBottom: 4, alignItems: 'center' },
  title: { fontSize: font.h1, fontWeight: '900' },
  scroll: { padding: 16, gap: 12, paddingTop: 4 },
  footer: { paddingHorizontal: 16, paddingTop: 8 },
  h2: { fontSize: font.h2, fontWeight: '800' },
  p: { fontSize: font.body, color: colors.textDim, lineHeight: 23 },
  note: { fontSize: font.small, color: colors.textMuted },
  guideRow: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.panelLight, borderRadius: radius.md, padding: 10 },
  guideName: { fontSize: font.body, fontWeight: '800' },
  guideText: { fontSize: font.small, color: colors.textDim },
  coinRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  segment: { flexDirection: 'row', gap: 6, backgroundColor: colors.bgDeep, borderRadius: radius.md, padding: 4 },
  segBtn: { flex: 1, minHeight: TOUCH, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.accent },
  segTxt: { fontWeight: '800', fontSize: font.body },
  toggleRow: { flexDirection: 'row', alignItems: 'center', minHeight: TOUCH },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginVertical: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.panelLight },
  dotOn: { backgroundColor: colors.gold, width: 20 },
  row: { flexDirection: 'row', gap: 10 },
});
