import React from 'react';
import Svg, { Path, Circle, SvgProps } from 'react-native-svg';
import { colors } from '../../constants/colors';

export const UserIcon = (props: SvgProps) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" {...props}>
    {/* Head */}
    <Circle
      cx="12"
      cy="8"
      r="5"
      stroke={props.color || colors.gray900}
      strokeWidth={2}
    />
    {/* Shoulders */}
    <Path
      d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21"
      stroke={props.color || colors.gray900}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);