import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
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

const FLIGHT = 380;

/**
 * One coin on the table. Toy-style motion: it arcs in spinning, squashes flat
 * on impact and springs back, wobbles when its ability fires, pops when its
 * value changes, and shakes before it is destroyed.
 */
function TableCoinViewImpl({ coin, size, tableW, tableH, speed, reduceMotion, engraved, onPress }: Props) {
  const px = coin.x * tableW - size / 2;
  const py = coin.y * tableW - size / 2;
  const launchX = tableW / 2 - size / 2;
  const launchY = tableH + size * 0.2;

  const left = useSharedValue(coin.landed ? px : launchX);
  const top = useSharedValue(coin.landed ? py : launchY);
  const lift = useSharedValue(0); // height above the table, drives scale and shadow
  const spin = useSharedValue(1); // horizontal squash used for spinning and flips
  const squashY = useSharedValue(1);
  const pop = useSharedValue(1);
  const tilt = useSharedValue(0);
  const opacity = useSharedValue(coin.landed && !coin.destroyed ? 1 : 0);
  const glow = useSharedValue(0);
  const flash = useSharedValue(0);
  const [shownFace, setShownFace] = useState<Face>(coin.face);
  const wasLanded = useRef(coin.landed);
  const lastValue = useRef(coin.value);
  const t = (ms: number) => Math.max(20, ms / speed);

  // Toss / landing.
  useEffect(() => {
    if (coin.landed && !wasLanded.current) {
      wasLanded.current = true;
      setShownFace(coin.face);
      if (reduceMotion) {
        left.value = px;
        top.value = py;
        opacity.value = withTiming(1, { duration: t(200) });
        return;
      }
      const f = t(FLIGHT);
      opacity.value = withTiming(1, { duration: t(60) });
      left.value = withTiming(px, { duration: f, easing: Easing.out(Easing.quad) });
      top.value = withTiming(py, { duration: f, easing: Easing.out(Easing.quad) });
      lift.value = withSequence(
        withTiming(1, { duration: f * 0.5, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: f * 0.5, easing: Easing.in(Easing.quad) }),
      );
      spin.value = withSequence(
        withTiming(0.12, { duration: f / 6 }),
        withTiming(1, { duration: f / 6 }),
        withTiming(0.12, { duration: f / 6 }),
        withTiming(1, { duration: f / 6 }),
        withTiming(0.12, { duration: f / 6 }),
        withTiming(1, { duration: f / 6 }),
      );
      // Impact: squash flat, overshoot tall, settle.
      squashY.value = withDelay(
        f,
        withSequence(
          withTiming(0.55, { duration: t(60), easing: Easing.out(Easing.quad) }),
          withTiming(1.18, { duration: t(110), easing: Easing.out(Easing.quad) }),
          withTiming(0.94, { duration: t(80) }),
          withTiming(1, { duration: t(70) }),
        ),
      );
    } else if (!coin.landed) {
      wasLanded.current = false;
      left.value = launchX;
      top.value = launchY;
      opacity.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.landed]);

  // Bumps: skid to the new spot with a wobble.
  useEffect(() => {
    if (!coin.landed) return;
    const d = reduceMotion ? 0 : t(300);
    left.value = withTiming(px, { duration: d, easing: Easing.out(Easing.back(1.6)) });
    top.value = withTiming(py, { duration: d, easing: Easing.out(Easing.back(1.6)) });
    if (!reduceMotion && wasLanded.current) {
      tilt.value = withSequence(withTiming(-18, { duration: t(80) }), withTiming(12, { duration: t(100) }), withTiming(0, { duration: t(120) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [px, py]);

  // Flips: jump up, squash to an edge, swap the face, open again.
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
    spin.value = withSequence(withTiming(0.04, { duration: half }), withTiming(1, { duration: half, easing: Easing.out(Easing.back(2)) }));
    lift.value = withSequence(withTiming(0.6, { duration: half }), withTiming(0, { duration: half, easing: Easing.in(Easing.quad) }));
    const id = setTimeout(() => setShownFace(coin.face), half);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.face]);

  // Ability pulse: glow + a quick wobble.
  useEffect(() => {
    if (coin.pulse === 0) return;
    glow.value = withSequence(withTiming(1, { duration: t(110) }), withTiming(0, { duration: t(300) }));
    if (!reduceMotion) {
      tilt.value = withSequence(withTiming(-10, { duration: t(70) }), withTiming(10, { duration: t(90) }), withTiming(0, { duration: t(90) }));
      pop.value = withSequence(withTiming(1.16, { duration: t(100), easing: Easing.out(Easing.back(3)) }), withTiming(1, { duration: t(150) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.pulse]);

  // Hit flash: the coin goes near-white for ~100 ms when struck.
  useEffect(() => {
    if (coin.flash === 0 || reduceMotion) return;
    flash.value = withSequence(withTiming(0.9, { duration: t(30) }), withTiming(0, { duration: t(110) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.flash]);

  // Value changes: a springy pop (bigger for permanent growth is not known here, so keep it uniform).
  useEffect(() => {
    if (coin.value === lastValue.current) return;
    const grew = coin.value > lastValue.current;
    lastValue.current = coin.value;
    if (reduceMotion || !wasLanded.current) return;
    pop.value = withSequence(
      withTiming(grew ? 1.24 : 0.82, { duration: t(90), easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: t(200), easing: Easing.out(Easing.back(3)) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.value]);

  // Destruction: rattle, swell, then vanish into the debris.
  useEffect(() => {
    if (!coin.destroyed) {
      if (coin.landed) opacity.value = 1;
      return;
    }
    if (reduceMotion) {
      opacity.value = withTiming(0, { duration: t(250) });
      return;
    }
    tilt.value = withSequence(withTiming(-14, { duration: t(40) }), withTiming(14, { duration: t(40) }), withTiming(-14, { duration: t(40) }), withTiming(0, { duration: t(40) }));
    pop.value = withSequence(withTiming(1.35, { duration: t(160) }), withTiming(0, { duration: t(120), easing: Easing.in(Easing.quad) }));
    opacity.value = withDelay(t(220), withTiming(0, { duration: t(80) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.destroyed]);

  const style = useAnimatedStyle(() => ({
    left: left.value,
    top: top.value - lift.value * size * 0.55,
    opacity: opacity.value,
    transform: [
      { scale: (1 + lift.value * 0.45) * pop.value },
      { rotate: `${tilt.value}deg` },
      { scaleX: spin.value * (2 - squashY.value) },
      { scaleY: squashY.value },
    ],
  }));
  const shadowStyle = useAnimatedStyle(() => ({
    left: left.value + size * 0.1,
    top: top.value + size * 0.72,
    opacity: opacity.value * (0.18 + 0.22 * (1 - lift.value)),
    transform: [{ scale: 1 - lift.value * 0.35 }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value, transform: [{ scale: 1 + glow.value * 0.15 }] }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  const def = coinDef(coin.defId);
  const heads = shownFace === 'heads';
  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.shadow, { width: size * 0.8, height: size * 0.28, borderRadius: size }, shadowStyle]} />
      <Animated.View style={[styles.wrap, { width: size, height: size }, style]} pointerEvents={coin.destroyed ? 'none' : 'auto'}>
        <Pressable
          onPress={() => onPress(coin.uid)}
          accessibilityRole="button"
          accessibilityLabel={`${def.name}, ${shownFace}, value ${coin.value}${coin.destroyed ? ', destroyed' : ''}`}
          accessibilityHint="Shows this coin's ability"
          style={{ width: size, height: size }}
        >
          <Animated.View style={[styles.glow, { width: size + 18, height: size + 18, borderRadius: size }, glowStyle]} />
          <CoinArt defId={coin.defId} face={shownFace} size={size} level={coin.level} engraved={engraved} />
          <Animated.View pointerEvents="none" style={[styles.flash, { width: size * 0.84, height: size * 0.84, borderRadius: size, left: size * 0.08, top: size * 0.08 }, flashStyle]} />
          <View style={[styles.value, heads ? styles.valueHeads : styles.valueTails]}>
            <Txt style={[styles.valueTxt, !heads && { color: colors.paper }]}>{coin.value}</Txt>
          </View>
        </Pressable>
      </Animated.View>
    </>
  );
}

export const TableCoinView = React.memo(TableCoinViewImpl);

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  shadow: { position: 'absolute', backgroundColor: 'rgba(25,15,25,0.9)' },
  flash: { position: 'absolute', backgroundColor: '#FFFFFF' },
  glow: {
    position: 'absolute',
    left: -9,
    top: -9,
    backgroundColor: 'rgba(255, 236, 170, 0.55)',
  },
  value: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.ink,
    // white die-cut edge around the badge sticker
    outlineColor: '#FFFFFF',
    outlineWidth: 2.5,
    outlineStyle: 'solid',
  },
  valueHeads: { backgroundColor: colors.gold },
  valueTails: { backgroundColor: '#5F5A70' },
  valueTxt: { color: colors.ink, fontWeight: '700', fontSize: 15 },
});
