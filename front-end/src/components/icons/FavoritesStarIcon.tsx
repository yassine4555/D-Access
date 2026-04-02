import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const FavoritesStarIcon = ({ color = '#F4B740', ...props }: SvgProps & { color?: string }) => (
  <Svg width={46} height={46} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="m12 2.5 2.85 5.77 6.37.93-4.61 4.49 1.09 6.35L12 17.05l-5.7 2.99 1.09-6.35-4.61-4.49 6.37-.93L12 2.5Z"
      fill={color}
      stroke="#D99819"
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
  </Svg>
);
