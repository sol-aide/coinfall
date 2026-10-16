import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { coinDef, type Face } from '../../engine';
import { CoinArt } from '../art/CoinArt';
import { Txt } from '../components/ui';
import { colors } from '../theme';
import type { DisplayCoin } from './playback';

interface Props {
  coin: DisplayCoin;
  size: number;
  tableW: number;
  tableH: number;
  speed: number;
  reduceMotion: boolean;
  engraved: boolean;
  onPress: (uid: string) => void;
}

function TableCoinViewImpl({ coin, size, tableW, tableH, speed, reduceMotion, engraved, onPress }: Props) {
  const px = coin.x * tableW - size / 2;
  const py = coin.y * tableW - size / 2;
  const launchX = tableW / 2 - size / 2;
  const launchY = tableH + size * 0.2;

  const left = useSharedValue(coin.landed ? px : launchX);
  const top = useSharedValue(coin.landed ? py : launchY);
  const scale = useSharedValue(coin.landed ? 1 : 0.6);
  const squash = useSharedValue(1);
  const opacity = useSharedValue(coin.landed && !coin.destroyed ? 1 : 0);
  const glow = useSharedValue(0);
  const [shownFace, setShownFace] = useState<Face>(coin.face);
  const wasLanded = useRef(coin.landed);
  const t = (ms: number) => Math.max(20, ms / speed);

  // Toss / landing.
  useEffect(() => {
    if (coin.landed && !wasLanded.current) {
      wasLanded.current = true;
      setShownFace(coin.face);
      if (reduceMotion) {
        left.value = px;
        top.value = py;
        scale.value = 1;
        opacity.value = withTiming(1, { duration: t(200) });
        return;
      }
      opacity.value = withTiming(1, { duration: t(80) });
      left.value = withTiming(px, { duration: t(380), easing: Easing.out(Easing.quad) });
      top.value = withTiming(py, { duration: t(380), easing: Easing.out(Easing.quad) });
      scale.value = withSequence(
        withTiming(1.45, { duration: t(190), easing: Easing.out(Easing.quad) }),
        withTiming(0.92, { duration: t(160), easing: Easing.in(Easing.quad) }),
        withTiming(1, { duration: t(90) }),
      );
      squash.value = withSequence(
        withTiming(0.15, { duration: t(80) }),
        withTiming(1, { duration: t(80) }),
        withTiming(0.15, { duration: t(80) }),
        withTiming(1, { duration: t(80) }),
      );
    } else if (!coin.landed) {
      wasLanded.current = false;
      left.value = launchX;
      top.value = launchY;
      opacity.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.landed]);

  // Moves (bumps) and layout changes.
  useEffect(() => {
    if (!coin.landed) return;
    const d = reduceMotion ? 0 : t(300);
    left.value = withTiming(px, { duration: d, easing: Easing.out(Easing.back(1.2)) });
    top.value = withTiming(py, { duration: d, easing: Easing.out(Easing.back(1.2)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [px, py]);

  // Flips: squash to an edge, swap the face, open again.
  useEffect(() => {
    if (!wasLanded.current || coin.face === shownFace) {
      if (!wasLanded.current) setShownFace(coin.face);
      return;
    }
    if (reduceMotion) {
      setShownFace(coin.face);
      return;
    }
    const half = t(160);
    squash.value = withSequence(withTiming(0.05, { duration: half }), withTiming(1, { duration: half }));
    const id = setTimeout(() => setShownFace(coin.face), half);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.face]);

  // Ability pulse.
  useEffect(() => {
    if (coin.pulse === 0) return;
    glow.value = withSequence(withTiming(1, { duration: t(120) }), withTiming(0, { duration: t(260) }));
    if (!reduceMotion) scale.value = withSequence(withTiming(1.18, { duration: t(120) }), withTiming(1, { duration: t(180) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.pulse]);

  // Destruction.
  useEffect(() => {
    if (!coin.destroyed) {
      if (coin.landed) opacity.value = 1;
      return;
    }
    if (reduceMotion) {
      opacity.value = withTiming(0, { duration: t(250) });
      return;
    }
    scale.value = withSequence(withTiming(1.3, { duration: t(140) }), withTiming(0, { duration: t(280) }));
    opacity.value = withTiming(0, { duration: t(420) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.destroyed]);

  const style = useAnimatedStyle(() => ({
    left: left.value,
    top: top.value,
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { scaleX: squash.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  const def = coinDef(coin.defId);
  const heads = shownFace === 'heads';
  return (
    <Animated.View style={[styles.wrap, { width: size, height: size }, style]} pointerEvents={coin.destroyed ? 'none' : 'auto'}>
      <Pressable
        onPress={() => onPress(coin.uid)}
        accessibilityRole="button"
        accessibilityLabel={`${def.name}, ${shownFace}, value ${coin.value}${coin.destroyed ? ', destroyed' : ''}`}
        accessibilityHint="Shows this coin's ability"
        style={{ width: size, height: size }}
      >
        <Animated.View style={[styles.glow, { width: size + 14, height: size + 14, borderRadius: size }, glowStyle]} />
        <CoinArt defId={coin.defId} face={shownFace} size={size} level={coin.level} engraved={engraved} />
        <View style={[styles.value, heads ? styles.valueHeads : styles.valueTails]}>
          <Txt style={[styles.valueTxt, !heads && { color: colors.textDim }]}>{coin.value}</Txt>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const TableCoinView = React.memo(TableCoinViewImpl);

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  glow: {
    position: 'absolute',
    left: -7,
    top: -7,
    backgroundColor: 'rgba(255, 236, 140, 0.55)',
  },
  value: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  valueHeads: { backgroundColor: '#2A1B00', borderColor: colors.gold },
  valueTails: { backgroundColor: '#1A1F38', borderColor: '#59628F' },
  valueTxt: { color: colors.gold, fontWeight: '900', fontSize: 14 },
});
