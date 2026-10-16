import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { coinDef } from '../../engine';
import { CoinArt, coinPalette, tone } from '../art/CoinArt';

const SLICES = 7;
/** Coin thickness as a fraction of its diameter. */
export const THICKNESS = 0.15;
/** The rim's share of the CoinArt viewBox (r=48 in a 112-unit box). */
const RIM = 96 / 112;

interface Props {
  defId: string;
  level: number;
  engraved: boolean;
  size: number;
  /** Rotation about the horizontal axis, in degrees. 0 = face-on, 90 = edge-on. */
  angle: SharedValue<number>;
  flash: SharedValue<number>;
}

/**
 * A coin with real thickness, drawn in 2.5D: the face is an ellipse squashed by
 * cos(angle), and a stack of edge slices offset by sin(angle) forms the reeded
 * rim. The front face shows while cos > 0, the back face after it turns past
 * edge-on. A shading layer darkens the face as it turns away, and a glint
 * sweeps across it at the angle where it catches the lamp.
 */
export const Coin3D = React.memo(function Coin3D({ defId, level, engraved, size, angle, flash }: Props) {
  const race = coinDef(defId).race;
  const edgeLo = coinPalette(race, true).edge;
  const edgeHi = coinPalette(race, true).edgeHi;
  const thick = size * THICKNESS * RIM;
  const disc = size * RIM;

  const faceStyle = (front: boolean) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => {
      const a = (angle.value * Math.PI) / 180;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const visible = front ? c >= 0 : c < 0;
      return {
        opacity: visible ? 1 : 0,
        transform: [{ translateY: (-s * thick) / 2 }, { scaleY: Math.max(0.02, Math.abs(c)) }],
      };
    });
  const front = faceStyle(true);
  const back = faceStyle(false);
  const shade = useAnimatedStyle(() => {
    const a = (angle.value * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return {
      opacity: (1 - Math.abs(c)) * 0.55,
      transform: [{ translateY: (-s * thick) / 2 }, { scaleY: Math.max(0.02, Math.abs(c)) }],
    };
  });
  const glint = useAnimatedStyle(() => {
    const a = (angle.value * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    // Brightest when the face is turned ~25 degrees toward the lamp above.
    const facing = Math.cos(a - (Math.sign(c || 1) * 25 * Math.PI) / 180);
    const g = Math.pow(Math.max(0, Math.abs(facing)), 60);
    return {
      opacity: g * 0.65 + flash.value,
      transform: [{ translateY: (-s * thick) / 2 }, { scaleY: Math.max(0.02, Math.abs(c)) }],
    };
  });

  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      {Array.from({ length: SLICES }).map((_, i) => (
        <Slice key={i} index={i} angle={angle} thick={thick} size={size} disc={disc} color={i === SLICES - 1 ? tone(edgeLo, -0.3) : i % 2 ? edgeLo : edgeHi} />
      ))}
      <Animated.View style={[StyleSheet.absoluteFill, back]}>
        <CoinArt defId={defId} face="tails" size={size} level={level} engraved={engraved} bare />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, front]}>
        <CoinArt defId={defId} face="heads" size={size} level={level} engraved={engraved} bare />
      </Animated.View>
      <Animated.View style={[styles.disc, { width: disc, height: disc, borderRadius: disc / 2, left: (size - disc) / 2, top: (size - disc) / 2, backgroundColor: '#140A14' }, shade]} />
      <Animated.View style={[styles.disc, { width: disc, height: disc, borderRadius: disc / 2, left: (size - disc) / 2, top: (size - disc) / 2, backgroundColor: '#FFFFFF' }, glint]} />
    </View>
  );
});

/** One slice of the coin's edge, stacked between the two faces. */
function Slice({ index, angle, thick, size, disc, color }: { index: number; angle: SharedValue<number>; thick: number; size: number; disc: number; color: string }) {
  const style = useAnimatedStyle(() => {
    const a = (angle.value * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const f = (index + 1) / SLICES; // 0 = top face, 1 = bottom face
    return { transform: [{ translateY: s * thick * (f - 0.5) }, { scaleY: Math.max(0.02, Math.abs(c)) }] };
  });
  return (
    <Animated.View
      style={[
        styles.disc,
        { width: disc, height: disc, borderRadius: disc / 2, left: (size - disc) / 2, top: (size - disc) / 2, backgroundColor: color, borderWidth: 1, borderColor: 'rgba(20,8,10,0.35)' },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  disc: { position: 'absolute' },
});
