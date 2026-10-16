import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Pattern, Polygon, Rect, Stop } from 'react-native-svg';
import { star } from '../art/CoinArt';
import { colors } from '../theme';

/** The toy-room wallpaper behind every screen: a soft gradient with a scattered coin-and-star pattern. */
export const Backdrop = React.memo(function Backdrop() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3B2A8C" />
          <Stop offset="1" stopColor={colors.bgDeep} />
        </LinearGradient>
        <Pattern id="bgDots" width={72} height={72} patternUnits="userSpaceOnUse">
          <Circle cx={18} cy={18} r={7} fill="none" stroke={colors.bgPattern} strokeWidth={3} />
          <Polygon points={star(54, 54, 8)} fill={colors.bgPattern} />
          <Circle cx={54} cy={16} r={2.5} fill={colors.bgPattern} />
          <Circle cx={16} cy={56} r={2.5} fill={colors.bgPattern} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#bgGrad)" />
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#bgDots)" opacity={0.55} />
    </Svg>
  );
});
