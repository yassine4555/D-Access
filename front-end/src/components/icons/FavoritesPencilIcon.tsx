import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const FavoritesPencilIcon = ({ color = '#1B7CA6', ...props }: SvgProps & { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
    <Path d="M11.7 2.1a1.6 1.6 0 0 1 2.263 2.263l-7.12 7.12-2.939.677.677-2.939 7.12-7.12Z" fill={color} />
    <Path d="m9.6 3.9 2.5 2.5" stroke="#FFFFFF" strokeWidth={0.9} strokeLinecap="round" />
  </Svg>
);
