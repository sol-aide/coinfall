import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { coinDef, type Face } from '../../engine';
import { Txt } from '../components/ui';
import { colors } from '../theme';
import { Coin3D } from './Coin3D';
import type { DisplayCoin } from './playback';
import { REST_TILT, type Projection } from './projection';

interface Props {
  coin: DisplayCoin;
  /** Coin diameter at the near edge of the table. */
  size: number;
  proj: Projection;
  speed: number;
  reduceMotion: boolean;
  engraved: boolean;
  onPress: (uid: string) => void;
}

const FLIGHT = 560;
/** How high (in coin diameters) a tossed coin rises at the top of its arc. */
const TOSS_HEIGHT = 1.6;

/** Resting angle for a face: tilted away from the viewer, edge showing below. */
const restAngle = (face: Face) => (face === 'heads' ? REST_TILT : 180 - REST_TILT);

/** The next angle >= current + spins full turns that rests on `face`. */
function targetAngle(current: number, face: Face, spins: number): number {
  const base = restAngle(face);
  const k = Math.ceil((current + spins * 360 - base) / 360);
  return base + k * 360;
}

/**
 * One coin on the table, in semi-3D. It is tossed in from below the table,
 * tumbling end over end, drops onto the cloth with a bounce and a settling
 * wobble, hops and turns over when flipped, and skids when bumped.
 */
function TableCoinViewImpl({ coin, size: nearSize, proj, speed, reduceMotion, engraved, onPress }: Props) {
  const p = proj.project(coin.x, coin.y);
  const size = Math.round(nearSize * p.s);
  const px = p.x - size / 2;
  const py = p.y - size / 2;
  const launchX = proj.width / 2 - size / 2;
  const launchY = proj.height + size * 0.6;

  const left = useSharedValue(coin.landed ? px : launchX);
  const top = useSharedValue(coin.landed ? py : launchY);
  const lift = useSharedValue(0); // height above the cloth, in coin diameters
  const angle = useSharedValue(restAngle(coin.face));
  const roll = useSharedValue(0); // sideways lean, degrees
  const pop = useSharedValue(1);
  const opacity = useSharedValue(coin.landed && !coin.destroyed ? 1 : 0);
  const glow = useSharedValue(0);
  const flash = useSharedValue(0);
  const wasLanded = useRef(coin.landed);
  const lastFace = useRef(coin.face);
  const lastValue = useRef(coin.value);
  const t = (ms: number) => Math.max(16, ms / speed);

  /** Small decaying rock about the resting angle, like a coin settling. */
  const settle = (target: number, amp: number) =>
    withSequence(
      withTiming(target + amp, { duration: t(90), easing: Easing.out(Easing.quad) }),
      withTiming(target - amp * 0.55, { duration: t(110), easing: Easing.inOut(Easing.quad) }),
      withTiming(target + amp * 0.25, { duration: t(100), easing: Easing.inOut(Easing.quad) }),
      withTiming(target, { duration: t(110), easing: Easing.out(Easing.quad) }),
    );

  // Toss and landing.
  useEffect(() => {
    if (coin.landed && !wasLanded.current) {
      wasLanded.current = true;
      lastFace.current = coin.face;
      const rest = restAngle(coin.face);
      if (reduceMotion) {
        left.value = px;
        top.value = py;
        angle.value = rest;
        opacity.value = withTiming(1, { duration: t(200) });
        return;
      }
      const f = t(FLIGHT);
      // Start somewhere mid-turn and tumble 2-3 full turns before landing on the drawn face.
      const start = (coin.uid.charCodeAt(coin.uid.length - 1) * 47) % 360;
      angle.value = start;
      const target = targetAngle(start, coin.face, 2 + (start % 2));
      opacity.value = withTiming(1, { duration: t(60) });
      left.value = withTiming(px, { duration: f, easing: Easing.out(Easing.quad) });
      top.value = withTiming(py, { duration: f, easing: Easing.out(Easing.quad) });
      lift.value = withSequence(
        withTiming(TOSS_HEIGHT, { duration: f * 0.45, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: f * 0.55, easing: Easing.in(Easing.quad) }),
        withTiming(0.18, { duration: t(110), easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: t(120), easing: Easing.in(Easing.quad) }),
      );
      angle.value = withSequence(withTiming(target, { duration: f, easing: Easing.out(Easing.cubic) }), settle(target, 16));
      roll.value = withSequence(
        withTiming(((start % 3) - 1) * 14, { duration: f * 0.5 }),
        withTiming(0, { duration: f * 0.5 }),
        withTiming(6, { duration: t(100) }),
        withTiming(-3, { duration: t(110) }),
        withTiming(0, { duration: t(110) }),
      );
    } else if (!coin.landed) {
      wasLanded.current = false;
      left.value = launchX;
      top.value = launchY;
      opacity.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.landed]);

  // Bumps: skid to the new spot with a little hop.
  useEffect(() => {
    if (!coin.landed || !wasLanded.current) return;
    const d = reduceMotion ? 0 : t(320);
    left.value = withTiming(px, { duration: d, easing: Easing.out(Easing.cubic) });
    top.value = withTiming(py, { duration: d, easing: Easing.out(Easing.cubic) });
    if (!reduceMotion) {
      lift.value = withSequence(withTiming(0.35, { duration: d * 0.4 }), withTiming(0, { duration: d * 0.6, easing: Easing.in(Easing.quad) }));
      roll.value = withSequence(withTiming(18, { duration: d * 0.4 }), withTiming(-6, { duration: d * 0.4 }), withTiming(0, { duration: d * 0.4 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [px, py]);

  // Flips: hop up, turn over (one and a half turns) and settle on the new face.
  useEffect(() => {
    if (!wasLanded.current || coin.face === lastFace.current) return;
    lastFace.current = coin.face;
    if (reduceMotion) {
      angle.value = restAngle(coin.face);
      return;
    }
    const d = t(520);
    const target = targetAngle(angle.value, coin.face, 1);
    lift.value = withSequence(
      withTiming(0.9, { duration: d * 0.45, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: d * 0.55, easing: Easing.in(Easing.quad) }),
    );
    angle.value = withSequence(withTiming(target, { duration: d, easing: Easing.inOut(Easing.quad) }), settle(target, 12));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.face]);

  // Ability pulse: a glow and a small eager hop.
  useEffect(() => {
    if (coin.pulse === 0) return;
    glow.value = withSequence(withTiming(1, { duration: t(110) }), withTiming(0, { duration: t(320) }));
    if (!reduceMotion) {
      lift.value = withSequence(withTiming(0.22, { duration: t(110), easing: Easing.out(Easing.quad) }), withTiming(0, { duration: t(140), easing: Easing.in(Easing.quad) }));
      const rest = restAngle(lastFace.current);
      angle.value = withSequence(withTiming(rest - 14, { duration: t(110) }), settle(rest, 8));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.pulse]);

  // Hit flash.
  useEffect(() => {
    if (coin.flash === 0 || reduceMotion) return;
    flash.value = withSequence(withTiming(0.9, { duration: t(30) }), withTiming(0, { duration: t(120) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.flash]);

  // Value changes: a springy pop.
  useEffect(() => {
    if (coin.value === lastValue.current) return;
    const grew = coin.value > lastValue.current;
    lastValue.current = coin.value;
    if (reduceMotion || !wasLanded.current) return;
    pop.value = withSequence(
      withTiming(grew ? 1.18 : 0.86, { duration: t(90), easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: t(200), easing: Easing.out(Easing.back(3)) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.value]);

  // Destruction: rattle, then burst.
  useEffect(() => {
    if (!coin.destroyed) {
      if (coin.landed) opacity.value = 1;
      return;
    }
    if (reduceMotion) {
      opacity.value = withTiming(0, { duration: t(250) });
      return;
    }
    roll.value = withSequence(withTiming(-16, { duration: t(40) }), withTiming(16, { duration: t(40) }), withTiming(-12, { duration: t(40) }), withTiming(0, { duration: t(40) }));
    pop.value = withSequence(withTiming(1.25, { duration: t(150) }), withTiming(0.2, { duration: t(120), easing: Easing.in(Easing.quad) }));
    opacity.value = withDelay(t(200), withTiming(0, { duration: t(90) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin.destroyed]);

  const body = useAnimatedStyle(() => ({
    left: left.value,
    top: top.value - lift.value * size,
    opacity: opacity.value,
    transform: [{ scale: (1 + lift.value * 0.22) * pop.value }, { rotate: `${roll.value}deg` }],
  }));
  const shadow = useAnimatedStyle(() => ({
    left: left.value + size * 0.08 + lift.value * size * 0.15,
    top: top.value + size * 0.42,
    opacity: opacity.value * Math.max(0.12, 0.5 - lift.value * 0.2),
    transform: [{ scaleX: 1 - Math.min(0.5, lift.value * 0.25) }, { scaleY: 1 - Math.min(0.5, lift.value * 0.25) }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value, transform: [{ scaleY: 0.8 }, { scale: 1 + glow.value * 0.2 }] }));

  const def = coinDef(coin.defId);
  const heads = coin.face === 'heads';
  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.shadow, { width: size * 0.84, height: size * 0.52, borderRadius: size }, shadow]} />
      <Animated.View style={[styles.wrap, { width: size, height: size }, body]} pointerEvents={coin.destroyed ? 'none' : 'auto'}>
        <Pressable
          onPress={() => onPress(coin.uid)}
          accessibilityRole="button"
          accessibilityLabel={`${def.name}, ${coin.face}, value ${coin.value}${coin.destroyed ? ', destroyed' : ''}`}
          accessibilityHint="Shows this coin's ability"
          style={{ width: size, height: size }}
        >
          <Animated.View pointerEvents="none" style={[styles.glow, { width: size + 16, height: size + 16, borderRadius: size }, glowStyle]} />
          <Coin3D defId={coin.defId} level={coin.level} engraved={engraved} size={size} angle={angle} flash={flash} />
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
  shadow: { position: 'absolute', backgroundColor: 'rgba(8,4,8,0.95)' },
  glow: { position: 'absolute', left: -8, top: -8, backgroundColor: 'rgba(255, 228, 150, 0.55)' },
  value: {
    position: 'absolute',
    right: -4,
    bottom: 2,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  valueHeads: { backgroundColor: colors.gold },
  valueTails: { backgroundColor: '#5F5A70' },
  valueTxt: { color: colors.ink, fontWeight: '700', fontSize: 14 },
});
