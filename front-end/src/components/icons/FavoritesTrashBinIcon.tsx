import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const FavoritesTrashBinIcon = ({ color = '#DC2626', ...props }: SvgProps & { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      d="M6.333 2.667A.667.667 0 0 1 7 2h2a.667.667 0 0 1 .667.667V3.2h2.4a.6.6 0 1 1 0 1.2h-.467l-.468 8.154A1.6 1.6 0 0 1 9.534 14H6.466a1.6 1.6 0 0 1-1.598-1.446L4.4 4.4h-.467a.6.6 0 0 1 0-1.2h2.4v-.533Z"
      fill={color}
    />
    <Path d="M6.8 6.067a.6.6 0 0 1 .6.6v4a.6.6 0 1 1-1.2 0v-4a.6.6 0 0 1 .6-.6Zm2.4 0a.6.6 0 0 1 .6.6v4a.6.6 0 1 1-1.2 0v-4a.6.6 0 0 1 .6-.6Z" fill="#FFFFFF" fillOpacity={0.2} />
  </Svg>
);
