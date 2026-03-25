import React from 'react';
import Svg, { Path, Rect, SvgProps, Circle } from 'react-native-svg';
import { colors } from '../../constants/colors';

export const PlacesIcon = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    {/* Map Background */}
    <Rect x="3" y="6" width="18" height="15" rx="2" fill="#C8E6C9" stroke="#000" strokeWidth={1.5} />
    {/* Map Lines/Roads */}
    <Path d="M8 6V21M3 15H21" stroke="#FFF" strokeWidth={2} />
    {/* Pin Icon */}
    <Path
      d="M12 2C10.3431 2 9 3.34315 9 5C9 7.5 12 11 12 11C12 11 15 7.5 15 5C15 3.34315 13.6569 2 12 2Z"
      fill="#F44336"
      stroke="#000"
      strokeWidth={1}
    />
    <Circle cx="12" cy="5" r="1" fill="#FFF" />
  </Svg>
);