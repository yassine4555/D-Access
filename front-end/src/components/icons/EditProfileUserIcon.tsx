import React from 'react';
import Svg, { Defs, ClipPath, Rect, G, Path, SvgProps } from 'react-native-svg';

export const EditProfileUserIcon = (props: SvgProps) => (
  <Svg width={56} height={56} viewBox="0 0 56 56" fill="none" {...props}>
    <G clipPath="url(#clip0_edit_profile_user)">
      <Path
        d="M28 35C35.732 35 42 28.732 42 21C42 13.268 35.732 7 28 7C20.268 7 14 13.268 14 21C14 28.732 20.268 35 28 35Z"
        stroke={props.color || '#828282'}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 47.25C11.2372 39.9284 18.9328 35 28 35C37.0672 35 44.7628 39.9284 49 47.25"
        stroke={props.color || '#828282'}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_edit_profile_user">
        <Rect width={56} height={56} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);
