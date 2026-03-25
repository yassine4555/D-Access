import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
import { colors } from '../../constants/colors';

export const TargetPositionIcon = (props: SvgProps) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z"
      stroke={props.color || colors.gray900}
      strokeWidth={2}
    />
    <Path d="M12 2V5M12 19V22M2 12H5M19 12H22" 
      stroke={props.color || colors.gray900} 
      strokeWidth={2} 
      strokeLinecap="round" 
    />
  </Svg>
);