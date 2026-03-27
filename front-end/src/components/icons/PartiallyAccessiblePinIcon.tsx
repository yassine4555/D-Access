import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
import { colors } from '../../constants/colors';

export const PartiallyAccessiblePinIcon = (props: SvgProps) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" {...props}>
    {/* Outer Pin Shape */}
    <Path
      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z"
      stroke={props.color || colors.gray900}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Partial Access / Alert Symbol */}
    <Path
      d="M12 6V10M12 13H12.01"
      stroke={props.color || colors.gray900}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M8.5 14H15.5L12 5L8.5 14Z"
      stroke={props.color || colors.gray900}
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
  </Svg>
);