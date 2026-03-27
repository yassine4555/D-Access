import React from 'react';
import Svg, { Path, Circle, SvgProps } from 'react-native-svg';
import { colors } from '../../constants/colors';

export const InaccessiblePinIcon = (props: SvgProps) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" {...props}>
    {/* Outer Pin Shape */}
    <Path
      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z"
      stroke={props.color || colors.gray900}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Inaccessible / Blocked Symbol */}
    <Circle
      cx="12"
      cy="9"
      r="4"
      stroke={props.color || colors.gray900}
      strokeWidth={1.5}
    />
    <Path
      d="M14.5 6.5L9.5 11.5"
      stroke={props.color || colors.gray900}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);