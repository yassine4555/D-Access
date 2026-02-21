import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
import { colors } from '../../constants/colors';

export const CheckIcon = (props: SvgProps) => (
    <Svg width={12} height={12} viewBox="0 0 11 8" fill="none" {...props}>
        <Path
            d="M3.73609 7.84288L0.161085 4.35628C-0.0536949 4.14681 -0.0536949 3.80718 0.161085 3.59769L0.938884 2.8391C1.15366 2.62961 1.50193 2.62961 1.71671 2.8391L4.125 5.18782L9.28329 0.157101C9.49807 -0.0523671 9.84634 -0.0523671 10.0611 0.157101L10.8389 0.915689C11.0537 1.12516 11.0537 1.46479 10.8389 1.67428L4.51391 7.8429C4.29911 8.05237 3.95087 8.05237 3.73609 7.84288Z"
            fill={props.color || colors.white}
        />
    </Svg>
);
