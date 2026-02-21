import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
import { colors } from '../../constants/colors';

export const CaretDownIcon = (props: SvgProps) => (
    <Svg width={18} height={18} viewBox="0 0 19 18" fill="none" {...props}>
        <Path
            d="M4.72406 6.75H14.2723C14.9328 6.75 15.2631 7.50586 14.7955 7.94883L10.0233 12.4734C9.73382 12.7477 9.26253 12.7477 8.97308 12.4734L4.20081 7.94883C3.73324 7.50586 4.06351 6.75 4.72406 6.75Z"
            fill={props.color || colors.gray900}
        />
    </Svg>
);
