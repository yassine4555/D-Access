import React from 'react';
import Svg, { Path, SvgProps, Circle } from 'react-native-svg';
import { colors } from '../../constants/colors';

export const SearchIcon = (props: SvgProps) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle
      cx="11"
      cy="11"
      r="7"
      stroke={props.color || colors.gray900}
      strokeWidth={2}
    />
    <Path
      d="M20 20L16 16"
      stroke={props.color || colors.gray900}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);