import React from 'react';
import Svg, { Circle, Path, SvgProps } from 'react-native-svg';
import { colors } from '../../constants/colors';

export const UnknownPinIcon = (props: SvgProps) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 4C9.23858 4 7 6.23858 7 9H9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.1815 14.3155 11.2179 13.3195 11.7126C11.8885 12.4233 11 13.8735 11 15.4717V16H13V15.4717C13 14.6322 13.4629 13.8698 14.2095 13.4989C15.8735 12.6724 17 10.9442 17 9C17 6.23858 14.7614 4 12 4Z"
      fill={props.color || colors.gray900}
    />
    <Circle cx="12" cy="19" r="1.5" fill={props.color || colors.gray900} />
  </Svg>
);
