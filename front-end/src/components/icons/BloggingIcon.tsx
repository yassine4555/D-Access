import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';
import { colors } from '../../constants/colors';

export const BloggingIcon = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    {/* Laptop Base */}
    <Rect x="4" y="10" width="16" height="10" rx="1" fill="#BBDEFB" stroke="#000" strokeWidth={1.5} />
    <Path d="M2 21H22" stroke="#000" strokeWidth={2} strokeLinecap="round" />
    
    {/* Chat Bubble */}
    <Path
      d="M14 4H8C6.89543 4 6 4.89543 6 6V11C6 12.1046 6.89543 13 8 13H9L10 15L11 13H14C15.1046 13 16 12.1046 16 11V6C16 4.89543 15.1046 4 14 4Z"
      fill="#FFE082"
      stroke="#000"
      strokeWidth={1.2}
    />
    
    {/* Pen */}
    <Path
      d="M19.5 2.5L14 8L15 9L20.5 3.5C20.7761 3.22386 20.7761 2.77614 20.5 2.5V2.5C20.2239 2.22386 19.7761 2.22386 19.5 2.5Z"
      fill="#FF8A80"
      stroke="#000"
      strokeWidth={1}
    />
  </Svg>
);