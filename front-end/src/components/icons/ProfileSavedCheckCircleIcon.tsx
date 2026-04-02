import React from 'react';
import Svg, { Circle, Path, SvgProps } from 'react-native-svg';

export const ProfileSavedCheckCircleIcon = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx={12} cy={12} r={10} stroke="#12B76A" strokeWidth={2} />
    <Path
      d="M8 12L10.7 14.7L16 9.4"
      stroke="#12B76A"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
