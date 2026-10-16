import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, Path } from 'react-native-svg';
import { Txt } from '../components/ui';
import { colors } from '../theme';
import { StickerText } from './fx';

const W = 250;
const H = 190;
const SCALLOPS = 9;

/** Path of a card whose bottom edge is a row of scallops (bunting). */
function scallopPath(w: number, h: number, inset = 0): string {
  const r = (w - inset * 2) / SCALLOPS / 2;
  let d = `M${inset + 14} ${inset} H${w - inset - 14} Q${w - inset} ${inset} ${w - inset} ${inset + 14} V${h - r - inset}`;
  for (let i = SCALLOPS - 1; i >= 0; i--) d += ` A${r} ${r} 0 0 1 ${inset + i * r * 2} ${h - r - inset}`;
  d += ` V${inset + 14} Q${inset} ${inset} ${inset + 14} ${inset} Z`;
  return d;
}

export function roundWord(total: number): string {
  if (total >= 60) return 'Huge haul!';
  if (total >= 30) return 'Big haul!';
  if (total >= 12) return 'Nice round!';
  if (total > 0) return 'Every coin counts';
  return 'Nothing this time';
}

/** End-of-round card: drops in, overshoots, settles. */
export function RoundCard({ total, still }: { total: number; still: boolean }) {
  const y = useSharedValue(still ? 0 : -70);
  const s = useSharedValue(still ? 1 : 0.6);
  useEffect(() => {
    if (still) return;
    y.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.back(1.6)) });
    s.value = withSequence(withTiming(1.08, { duration: 200, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 120 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }, { scale: s.value }] }));
  const rays = Array.from({ length: 16 }, (_, i) => (Math.PI * 2 * i) / 16);
  const outer = scallopPath(W, H);
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ width: W, height: H + 8 }, style]}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${roundWord(total)} plus ${total} gold`}
    >
      <Svg width={W} height={H + 8} style={StyleSheet.absoluteFill}>
        <Defs>
          <ClipPath id="roundCardClip">
            <Path d={outer} />
          </ClipPath>
        </Defs>
        <Path d={outer} fill="rgba(10,6,12,0.45)" transform="translate(0 7)" />
        <Path d={outer} fill={colors.paper} stroke={colors.ink} strokeWidth={3} />
        <G clipPath="url(#roundCardClip)">
          {rays.map((a, i) =>
            i % 2 ? null : (
              <Path
                key={i}
                d={`M${W / 2} ${H * 0.42} L${W / 2 + Math.cos(a) * 260} ${H * 0.42 + Math.sin(a) * 260} L${W / 2 + Math.cos(a + 0.2) * 260} ${H * 0.42 + Math.sin(a + 0.2) * 260} Z`}
                fill="#F6C46A"
                opacity={0.55}
              />
            ),
          )}
          <Circle cx={W / 2} cy={H * 0.42} r={52} fill="#FBE2A6" opacity={0.8} />
        </G>
        <Path d={scallopPath(W, H, 8)} fill="none" stroke={colors.accent} strokeWidth={2} strokeDasharray="6 5" />
      </Svg>
      <View style={styles.content}>
        <StickerText text={`+${total}`} size={50} fill={total > 0 ? '#E39A0B' : '#8C8496'} width={W} height={76} />
        <Txt style={styles.word}>{roundWord(total)}</Txt>
        <Txt style={styles.sub}>gold this round</Txt>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: { ...StyleSheet.absoluteFill, alignItems: 'center', paddingTop: 22 },
  word: { fontSize: 22, fontWeight: '700', color: colors.ink, marginTop: -2 },
  sub: { fontSize: 14, color: '#6B5F55', fontWeight: '600' },
});
