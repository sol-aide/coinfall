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

function TableCoinViewImpl({ coin, size, tableW, tableH, speed, reduceMotion, engraved, onPress }: Props) {
  const px = coin.x * tableW - size / 2;
  const py = coin.y * tableW - size / 2;
  const launchX = tableW / 2 - size / 2;
  const launchY = tableH + size * 0.2;

  const left = useSharedValue(coin.landed ? px : launchX);
  const top = useSharedValue(coin.landed ? py : launchY);
  const scale = useSharedValue(coin.landed ? 1 : 0.6);
  /** Spin: horizontal squash while the coin turns over in the air. */
  const squash = useSharedValue(1);
  /** Height above the table, 0..1: lifts the coin and shrinks/fades its shadow. */
  const lift = useSharedValue(0);
  /** Squash & stretch: >1 stretched tall, <1 squashed flat. */
  const stretch = useSharedValue(1);
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
      // Toss: an arc toward the viewer, two turns in the air, stretched as it
      // falls, then a hard squash on impact that springs back with a wobble.
      const flight = t(340);
      opacity.value = withTiming(1, { duration: t(60) });
      left.value = withTiming(px, { duration: flight, easing: Easing.out(Easing.quad) });
      top.value = withTiming(py, { duration: flight, easing: Easing.out(Easing.quad) });
      scale.value = 1;
      lift.value = withSequence(
        withTiming(1, { duration: flight * 0.5, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: flight * 0.5, easing: Easing.in(Easing.quad) }),
      );
      squash.value = withSequence(
        withTiming(0.12, { duration: flight / 4 }),
        withTiming(1, { duration: flight / 4 }),
        withTiming(0.12, { duration: flight / 4 }),
        withTiming(1, { duration: flight / 4 }),
      );
      stretch.value = withSequence(
        withDelay(flight * 0.55, withTiming(1.14, { duration: flight * 0.45, easing: Easing.in(Easing.quad) })),
        withTiming(0.72, { duration: t(60), easing: Easing.out(Easing.quad) }),
        withTiming(1.08, { duration: t(90), easing: Easing.out(Easing.quad) }),
        withTiming(0.97, { duration: t(70) }),
        withTiming(1, { duration: t(60) }),
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
    if (!reduceMotion && wasLanded.current) {
      // Knocked: a small hop, squashed on the hit, stretched as it skids.
      lift.value = withSequence(withTiming(0.3, { duration: d * 0.45, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: d * 0.55, easing: Easing.in(Easing.quad) }));
      stretch.value = withSequence(withTiming(0.8, { duration: t(50) }), withTiming(1.08, { duration: d * 0.5 }), withTiming(1, { duration: d * 0.4 }));
    }
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
    lift.value = withSequence(withTiming(0.45, { duration: half, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: half, easing: Easing.in(Easing.quad) }));
    stretch.value = withSequence(withTiming(1, { duration: half * 2 }), withTiming(0.85, { duration: t(50) }), withTiming(1, { duration: t(90) }));
    const id = setTimeout(() => setShownFace(coin.face), half);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.face]);

  // Ability pulse.
  useEffect(() => {
    if (coin.pulse === 0) return;
    glow.value = withSequence(withTiming(1, { duration: t(120) }), withTiming(0, { duration: t(260) }));
    if (!reduceMotion) {
      scale.value = withSequence(withTiming(1.16, { duration: t(110), easing: Easing.out(Easing.quad) }), withTiming(1, { duration: t(170) }));
      stretch.value = withSequence(withTiming(1.1, { duration: t(110) }), withTiming(0.94, { duration: t(90) }), withTiming(1, { duration: t(90) }));
    }
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
    // Squeezed flat, then the torn halves (drawn by the fx layer) take over.
    stretch.value = withTiming(0.7, { duration: t(70) });
    opacity.value = withDelay(t(70), withTiming(0, { duration: 30 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.destroyed]);

  const style = useAnimatedStyle(() => ({
    left: left.value,
    top: top.value,
    opacity: opacity.value,
  }));
  const coinStyle = useAnimatedStyle(() => {
    const st = stretch.value;
    const sc = scale.value * (1 + lift.value * 0.32);
    return {
      transform: [
        { translateY: -lift.value * size * 0.55 + (1 - st) * size * 0.3 },
        { scale: sc },
        { scaleX: squash.value * (2 - st) },
        { scaleY: st },
      ],
    };
  });
  const shadowStyle = useAnimatedStyle(() => ({
    opacity: 0.28 * (1 - lift.value * 0.55),
    transform: [{ translateX: 2 + lift.value * size * 0.12 }, { translateY: 4 + lift.value * size * 0.05 }, { scale: 1 - lift.value * 0.25 }],
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
        <Animated.View style={[styles.shadow, { width: size, height: size, borderRadius: size / 2 }, shadowStyle]} />
        <Animated.View style={coinStyle}>
          <Animated.View style={[styles.glow, { width: size + 14, height: size + 14, borderRadius: size }, glowStyle]} />
          {/* Wrapped so it stacks above the absolutely positioned glow on the web too. */}
          <View>
            <CoinArt defId={coin.defId} face={shownFace} size={size} level={coin.level} engraved={engraved} shadow={false} />
          </View>
          <View style={[styles.value, heads ? styles.valueHeads : styles.valueTails]}>
            <Txt style={[styles.valueTxt, !heads && { color: colors.textMuted }]}>{coin.value}</Txt>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export const TableCoinView = React.memo(TableCoinViewImpl);

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  shadow: { position: 'absolute', left: 0, top: 0, backgroundColor: '#54341A' },
  glow: {
    position: 'absolute',
    left: -7,
    top: -7,
    backgroundColor: 'rgba(255, 252, 240, 0.45)',
  },
  value: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.sticker,
    backgroundColor: colors.panel,
  },
  valueHeads: { backgroundColor: colors.panel },
  valueTails: { backgroundColor: colors.panelLight },
  valueTxt: { color: colors.goldInk, fontWeight: '900', fontSize: 15 },
});
