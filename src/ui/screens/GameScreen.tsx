import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BASE_DRAW,
  ROUNDS_PER_PHASE,
  SKIP_GOLD,
  currentDues,
  chooseReward,
  computeMods,
  playRound,
  radius as adjRadius,
  rerollRewards,
  type RunState,
} from '../../engine';
import { CoinDetail, CoinRow } from '../components/CoinInfo';
import { Hud } from '../components/Hud';
import { Button, Overlay, Txt, thud } from '../components/ui';
import { useGame } from '../state/GameContext';
import { Table } from '../table/Table';
import { usePlayback } from '../table/playback';
import { colors, font, radius } from '../theme';
import { Tutorial } from './InfoScreens';
import { BagOverlay, CharmsOverlay } from './Overlays';

export function GameScreen({ onMenu }: { onMenu: () => void }) {
  const { run, act, settings, reduceMotion, updateSettings } = useGame();
  const r = run as RunState;
  const insets = useSafeAreaInsets();
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [detail, setDetail] = useState<string | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [charmsOpen, setCharmsOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(true);

  const roundKey = r.lastRound ? `${r.lastRound.phase}-${r.lastRound.round}-${r.stats.roundsPlayed}` : 'none';
  const mountKey = useRef(roundKey);
  const instant = roundKey === mountKey.current;
  const showRound = r.screen === 'reward' ? r.lastRound : undefined;
  const { state, popups, skip } = usePlayback(showRound, showRound ? roundKey : 'none', settings.speed, reduceMotion, instant);
  const playing = !!state && !state.done && r.screen === 'reward';

  useEffect(() => {
    setSelected(null);
    setShowDetails(false);
    setSheetOpen(true);
  }, [roundKey]);

  useEffect(() => {
    if (r.fusionNotes.length) {
      setToast(r.fusionNotes.join('\n'));
      const id = setTimeout(() => setToast(null), 3200);
      return () => clearTimeout(id);
    }
  }, [r.fusionNotes]);

  const mods = useMemo(() => computeMods(r.charms), [r.charms]);
  const tableW = Math.max(0, Math.min(area.w - 24, area.h / 1.2));
  const coins = state ? state.order.map((u) => state.coins[u]) : [];

  const toss = () => {
    thud(settings.haptics);
    act(playRound);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 4 }]}>
      <Hud
        run={r}
        goldOverride={playing && state && r.lastRound ? r.gold - r.lastRound.total + state.total : undefined}
        onBag={() => setBagOpen(true)} onCharms={() => setCharmsOpen(true)} onMenu={onMenu} />

      <DuesBar
        gold={playing && state && r.lastRound ? r.gold - r.lastRound.total + state.total : r.gold}
        dues={currentDues(r)}
        roundsLeft={ROUNDS_PER_PHASE - r.round + (r.screen === 'ready' ? 1 : 0)}
      />
      <View style={styles.tableArea} onLayout={(e) => setArea({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {tableW > 0 && (
          <Table
            width={tableW}
            coins={coins}
            popups={popups}
            adjacency={adjRadius(mods)}
            speed={settings.speed}
            reduceMotion={reduceMotion}
            bag={r.bag}
            onCoinPress={setDetail}
          >
            {r.screen === 'ready' && (
              <View style={styles.emptyHint} pointerEvents="none">
                <Txt style={styles.emptyTitle}>Round {r.round}</Txt>
                <Txt style={styles.emptyText}>
                  Draw {Math.min(r.bag.length, BASE_DRAW + mods.drawBonus)} coins from your bag of {r.bag.length} and toss them.
                </Txt>
                <Txt style={styles.emptyText}>Heads pay their value in gold.</Txt>
              </View>
            )}
          </Table>
        )}
      </View>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {r.screen === 'ready' && (
          <Button big label="Toss coins" icon="play" onPress={toss} testID="toss" a11yHint="Draws coins from your bag and tosses them onto the table" />
        )}
        {r.screen === 'reward' && state?.done && !sheetOpen && r.lastRound && (
          <View style={styles.playRow}>
            <View style={{ flex: 1 }}>
              <Txt style={styles.stage}>Round {r.lastRound.round}</Txt>
              <Txt style={styles.caption}>+{r.lastRound.total} gold</Txt>
            </View>
            <Button label="Pick a coin" variant="gold" onPress={() => setSheetOpen(true)} testID="open-reward" />
          </View>
        )}
        {playing && state && (
          <View style={styles.playRow}>
            <View style={{ flex: 1 }} accessibilityLiveRegion="polite">
              <Txt style={styles.stage}>{state.stage ?? ''}</Txt>
              <Txt style={styles.caption} numberOfLines={1}>
                {state.caption}
              </Txt>
              {!!state.detail && (
                <Txt style={styles.detail} numberOfLines={2}>
                  {state.detail}
                </Txt>
              )}
            </View>
            <View style={styles.totalBox}>
              <Txt style={styles.totalSmall}>Gold</Txt>
              <Txt style={styles.total}>+{state.total}</Txt>
            </View>
            <Button label="Skip" variant="secondary" onPress={skip} testID="skip" a11yHint="Skips the animation" />
          </View>
        )}
      </View>

      {r.screen === 'reward' && state?.done && sheetOpen && r.lastRound && (
        <Overlay position="bottom">
          <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8 }}>
            <View style={styles.sumRow}>
              <Txt style={styles.sumTitle} accessibilityRole="header">
                Round {r.lastRound.round} earned
              </Txt>
              <Txt style={styles.sumValue}>+{r.lastRound.total} gold</Txt>
            </View>
            <View style={styles.sheetTools}>
              <Button
                label={showDetails ? 'Hide details' : 'Score details'}
                variant="ghost"
                onPress={() => setShowDetails((v) => !v)}
                testID="details"
                style={{ flex: 1 }}
              />
              <Button label="See table" variant="ghost" onPress={() => setSheetOpen(false)} testID="see-table" style={{ flex: 1 }} />
            </View>
            {showDetails && <Breakdown run={r} />}
            <Txt style={styles.pickTitle} accessibilityRole="header">
              Add a coin to your bag
            </Txt>
            {r.rewardChoices.map((id, i) => (
              <CoinRow
                key={`${id}-${i}`}
                defId={id}
                run={r}
                selected={selected === i}
                onPress={() => setSelected(i)}
                a11yHint="Selects this coin"
                testID={`reward-${i}`}
              />
            ))}
          </ScrollView>
          <View style={styles.rewardButtons}>
            <Button
              label="Skip"
              sub={`+${SKIP_GOLD} gold`}
              variant="secondary"
              onPress={() => act((s) => chooseReward(s, null))}
              testID="reward-skip"
              style={{ flex: 1 }}
            />
            <Button
              label="Reroll"
              sub={`${r.rerollTokens} left`}
              a11yLabel={`Reroll the choices with a token, ${r.rerollTokens} left`}
              icon="reroll"
              variant="secondary"
              disabled={r.rerollTokens < 1}
              onPress={() => {
                setSelected(null);
                act(rerollRewards);
              }}
              testID="reward-reroll"
              style={{ flex: 1 }}
            />
            <Button
              label="Take"
              variant="gold"
              disabled={selected === null}
              onPress={() => selected !== null && act((s) => chooseReward(s, selected))}
              testID="reward-take"
              style={{ flex: 1.2 }}
            />
          </View>
        </Overlay>
      )}

      {toast && (
        <View style={[styles.toast, { top: insets.top + 6 }]} pointerEvents="none" accessibilityLiveRegion="assertive">
          <Txt style={styles.toastTxt}>{toast}</Txt>
        </View>
      )}
      {!settings.tutorialSeen && r.screen === 'ready' && <Tutorial onDone={() => updateSettings({ tutorialSeen: true })} />}
      {detail && <CoinDetail run={r} uid={detail} onClose={() => setDetail(null)} />}
      {bagOpen && <BagOverlay run={r} onClose={() => setBagOpen(false)} />}
      {charmsOpen && <CharmsOverlay run={r} onClose={() => setCharmsOpen(false)} />}
    </View>
  );
}

function DuesBar({ gold, dues, roundsLeft }: { gold: number; dues: number; roundsLeft: number }) {
  const pct = Math.min(1, gold / Math.max(1, dues));
  const done = gold >= dues;
  return (
    <View
      style={styles.duesBar}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Guild dues: ${gold} of ${dues} gold, ${roundsLeft} round${roundsLeft === 1 ? '' : 's'} left this phase`}
    >
      <View style={styles.duesTrack}>
        <View style={[styles.duesFill, { width: `${pct * 100}%`, backgroundColor: done ? colors.success : colors.gold }]} />
      </View>
      <Txt style={styles.duesTxt}>
        {done ? 'Dues covered' : `${gold} / ${dues} for the Guild`} · {roundsLeft} round{roundsLeft === 1 ? '' : 's'} left
      </Txt>
    </View>
  );
}

function Breakdown({ run }: { run: RunState }) {
  const lr = run.lastRound!;
  return (
    <View style={styles.breakdown}>
      {lr.breakdown.length === 0 && <Txt style={styles.bdLine}>Nothing scored this round.</Txt>}
      {lr.breakdown.map((l, i) => (
        <View key={i} style={styles.bdRow}>
          <Txt style={[styles.bdLine, { flex: 1 }]} numberOfLines={1}>
            {l.kind === 'coin' ? '● ' : l.kind === 'charm' ? '◇ ' : '✦ '}
            {l.label}
          </Txt>
          <Txt style={styles.bdAmt}>+{l.amount}</Txt>
        </View>
      ))}
      {lr.destroyed.length > 0 && (
        <Txt style={[styles.bdLine, { color: colors.danger }]}>
          {lr.destroyed.length} coin{lr.destroyed.length > 1 ? 's' : ''} destroyed this round.
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  duesBar: { paddingHorizontal: 12, marginTop: 8, gap: 3 },
  duesTrack: { height: 8, borderRadius: 4, backgroundColor: colors.bgDeep, overflow: 'hidden' },
  duesFill: { height: 8, borderRadius: 4 },
  duesTxt: { fontSize: font.tiny, color: colors.textDim, textAlign: 'center' },
  tableArea: { flex: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  emptyHint: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 6 },
  emptyTitle: { fontSize: font.h1, fontWeight: '900', color: '#FFF3DD' },
  emptyText: { fontSize: font.body, color: '#FFE9C9', textAlign: 'center' },
  bottom: { paddingHorizontal: 12, minHeight: 86, justifyContent: 'center' },
  playRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stage: { fontSize: font.tiny, color: colors.textMuted, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  caption: { fontSize: font.body, fontWeight: '700' },
  detail: { fontSize: font.tiny, color: colors.textDim, marginTop: 1 },
  totalBox: { alignItems: 'center', minWidth: 58 },
  totalSmall: { fontSize: font.tiny, color: colors.textDim },
  total: { fontSize: font.h2, fontWeight: '900', color: colors.gold },
  sumRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sumTitle: { fontSize: font.h2, fontWeight: '800' },
  sumValue: { fontSize: font.h1, fontWeight: '900', color: colors.gold },
  pickTitle: { fontSize: font.body, fontWeight: '800', color: colors.textDim, marginTop: 2 },
  sheetTools: { flexDirection: 'row', gap: 8 },
  rewardButtons: { flexDirection: 'row', gap: 8, marginTop: 10 },
  breakdown: { backgroundColor: colors.bgDeep, borderRadius: radius.md, padding: 10, gap: 3 },
  bdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bdLine: { fontSize: font.small, color: colors.textDim },
  bdAmt: { fontSize: font.small, color: colors.gold, fontWeight: '800' },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#3B2A6E',
    borderColor: colors.gold,
    borderWidth: 2,
    borderRadius: radius.md,
    padding: 12,
    zIndex: 60,
  },
  toastTxt: { textAlign: 'center', fontWeight: '800' },
});
