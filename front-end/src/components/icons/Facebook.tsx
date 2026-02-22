import React from 'react';
import Svg, { Path, G, Defs, ClipPath, Rect, SvgProps } from 'react-native-svg';
import { colors } from '../../constants/colors';

export const FacebookIcon = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <G clipPath="url(#clip0)">
      <Path
        d="M9.964 17.111C10.538 17.668 11.274 17.946 12.01 17.946..."
        stroke={props.color || colors.gray900}
        strokeWidth={1.5}
      />
    </G>
    <Defs>
      <ClipPath id="clip0">
        <Rect width="24" height="24" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);