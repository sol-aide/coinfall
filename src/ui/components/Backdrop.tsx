import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme';

const W = 390;
const H = 844;

/**
 * The moneylender's stall at night, drawn soft and low-contrast (no outlines)
 * so the inked sticker coins and UI always pop in front of it. A fixed
 * 390x844 composition, scaled to cover any screen.
 */
export const Backdrop = React.memo(function Backdrop({ still = false }: { still?: boolean }) {
  const glow = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    glow.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.55 + glow.value * 0.25 }));

  return (
    <>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" pointerEvents="none">
        <Defs>
          <LinearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#3B2A33" />
            <Stop offset="0.6" stopColor="#2A1F29" />
            <Stop offset="1" stopColor="#17121B" />
          </LinearGradient>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1A2540" />
            <Stop offset="1" stopColor="#33466A" />
          </LinearGradient>
          <RadialGradient id="vignette" cx="50%" cy="45%" r="75%">
            <Stop offset="0.55" stopColor="#000000" stopOpacity={0} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.6} />
          </RadialGradient>
        </Defs>
        <Rect width={W} height={H} fill="url(#wall)" />
        {/* window with a moonlit sky over distant tents */}
        <Rect x={70} y={60} width={250} height={230} rx={18} fill="#4A3330" opacity={0.9} />
        <Rect x={80} y={70} width={230} height={210} rx={12} fill="url(#sky)" />
        <Circle cx={250} cy={120} r={22} fill="#F3E6C2" opacity={0.85} />
        <Circle cx={258} cy={114} r={20} fill="#22304E" opacity={0.95} />
        {[
          [110, 95],
          [150, 130],
          [190, 88],
          [130, 170],
          [210, 160],
          [290, 190],
          [100, 210],
          [280, 95],
        ].map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2 : 1.3} fill="#F3E6C2" opacity={0.7} />
        ))}
        <Path d="M80 280 L120 225 L160 280 Z M140 280 L190 210 L240 280 Z M220 280 L265 230 L310 280 Z" fill="#202A40" opacity={0.9} />
        <Path d="M80 175 H310 M195 70 V280" stroke="#4A3330" strokeWidth={7} opacity={0.9} />
        {/* bunting */}
        <Path d="M-10 40 Q195 95 400 40" stroke="#5A4048" strokeWidth={2} fill="none" />
        {Array.from({ length: 11 }).map((_, i) => {
          const x = 8 + i * 36;
          const y = 40 + Math.sin((i / 10) * Math.PI) * 27;
          const c = ['#7A4A4A', '#4A6A6A', '#7A6A3E'][i % 3];
          return <Path key={i} d={`M${x} ${y} L${x + 24} ${y + 1} L${x + 12} ${y + 24} Z`} fill={c} opacity={0.75} />;
        })}
        {/* shelves with jars and sacks, kept soft */}
        <G opacity={0.75}>
          <Rect x={-10} y={330} width={95} height={10} rx={3} fill="#4C352E" />
          <Rect x={10} y={292} width={26} height={38} rx={8} fill="#5B6F7A" />
          <Rect x={42} y={302} width={22} height={28} rx={7} fill="#7A5F4A" />
          <Rect x={-10} y={430} width={95} height={10} rx={3} fill="#4C352E" />
          <Ellipse cx={30} cy={410} rx={24} ry={20} fill="#6B5240" />
          <Rect x={305} y={330} width={95} height={10} rx={3} fill="#4C352E" />
          <Rect x={318} y={286} width={30} height={44} rx={9} fill="#6A5A7A" />
          <Rect x={354} y={300} width={24} height={30} rx={8} fill="#5F7A5A" />
          <Rect x={305} y={430} width={95} height={10} rx={3} fill="#4C352E" />
          <Ellipse cx={355} cy={410} rx={26} ry={20} fill="#7A5A3E" />
        </G>
        {/* lantern bodies */}
        <G opacity={0.85}>
          <Path d="M40 0 V95" stroke="#4C352E" strokeWidth={2} />
          <Rect x={28} y={95} width={24} height={34} rx={8} fill="#C97A2E" />
          <Path d="M352 0 V130" stroke="#4C352E" strokeWidth={2} />
          <Rect x={340} y={130} width={24} height={34} rx={8} fill="#C97A2E" />
        </G>
        <Rect width={W} height={H} fill="url(#vignette)" />
      </Svg>
      {/* warm lantern glow, gently breathing */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, glowStyle]}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
          <Defs>
            <RadialGradient id="lamp" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFC56B" stopOpacity={0.55} />
              <Stop offset="1" stopColor="#FFC56B" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={40} cy={112} r={90} fill="url(#lamp)" />
          <Circle cx={352} cy={147} r={90} fill="url(#lamp)" />
        </Svg>
      </Animated.View>
    </>
  );
});

export const BACKDROP_BASE = colors.bgDeep;
