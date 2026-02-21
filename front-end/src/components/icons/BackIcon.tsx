import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
import { colors } from '../../constants/colors';

export const BackIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path
            d="M15.05 19.9201L8.53005 13.4001C7.76005 12.6301 7.76005 11.3701 8.53005 10.6001L15.05 4.08008"
            stroke={props.color || colors.gray900}
            strokeWidth={1.5}
            strokeMiterlimit={10}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);
