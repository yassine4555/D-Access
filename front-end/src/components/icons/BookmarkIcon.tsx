import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
import { colors } from '../../constants/colors';

export const BookmarkIcon = (props: SvgProps) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M6 3H18C18.5523 3 19 3.44772 19 4V21L12 17L5 21V4C5 3.44772 5.44772 3 6 3Z"
      stroke={props.color || colors.gray900}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);