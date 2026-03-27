import React from 'react';
import Svg, { Path, SvgProps, Circle } from 'react-native-svg';
import { colors } from '../../constants/colors';

export const AccessiblePinIcon = (props: SvgProps) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" {...props}>
    {/* Outer Pin Shape */}
    <Path
      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z"
      stroke={props.color || colors.gray900}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Accessibility / Wheelchair Symbol Interior */}
    <Circle
      cx="13.5"
      cy="6.5"
      r="1.5"
      fill={props.color || colors.gray900}
    />
    <Path
      d="M15 10H12L10.5 13.5L12.5 15.5M9 10C9 11.6569 10.3431 13 12 13"
      stroke={props.color || colors.gray900}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);