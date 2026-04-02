import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const SettingsFavoriteIcon = (props: SvgProps) => (
    <Svg width={18} height={15} viewBox="0 0 18 15" fill="none" {...props}>
        <Path
            d="M0 5.09917C0 9.33641 3.618 11.594 6.2658 13.6155C7.2 14.3282 8.1 15 9 15C9.9 15 10.8 14.3291 11.7342 13.6146C14.3829 11.5949 18 9.33641 18 5.10004C18 0.863676 13.05 -2.14326 9 1.93105C4.95 -2.14326 0 0.861934 0 5.09917Z"
            fill={props.color || '#000000'}
        />
    </Svg>
);
