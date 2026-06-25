import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../constants/Colors';

type Props = {
  size?: number;
  ringColor?: string;
  flameColor?: string;
  showRing?: boolean;
};

// The FOMO flame mark — pure vector, no font or external image needed.
// Used on the loading screen, and reusable anywhere else a small
// brand mark is needed (e.g. empty states, headers).
export default function FomoBadge({
  size = 120,
  ringColor = Colors.red,
  flameColor = Colors.red,
  showRing = true,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {showRing && (
        <Circle cx="100" cy="100" r="86" fill="none" stroke={ringColor} strokeWidth="4" />
      )}
      <Path
        d="M100 38
           C 75 76, 53 100, 53 134
           C 53 168, 75 188, 100 188
           C 125 188, 147 168, 147 134
           C 147 112, 134 96, 122 84
           C 127 104, 115 116, 103 109
           C 94 103, 96 88, 100 38 Z"
        fill={flameColor}
      />
      <Path
        d="M100 118
           C 89 134, 82 147, 82 160
           C 82 175, 91 184, 100 184
           C 109 184, 118 175, 118 160
           C 118 149, 111 140, 104 134
           C 106 145, 99 152, 94 147
           C 90 143, 92 134, 100 118 Z"
        fill={Colors.bg}
      />
    </Svg>
  );
}
