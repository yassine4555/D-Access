import React from 'react';
import Svg, { Defs, ClipPath, Rect, G, Path, SvgProps } from 'react-native-svg';

export const SettingsDarkModeIcon = (props: SvgProps) => (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none" {...props}>
        <G clipPath="url(#clip0_settings_dark_mode)">
            <Path
                d="M9.95654 18C12.7326 18 15.2679 16.737 16.9476 14.6675C17.1961 14.3613 16.9251 13.9141 16.5411 13.9872C12.1746 14.8188 8.16474 11.4709 8.16474 7.06303C8.16474 4.52398 9.52395 2.18914 11.733 0.931992C12.0735 0.738211 11.9879 0.221941 11.601 0.150469C11.0585 0.0504468 10.5081 8.21369e-05 9.95654 0C4.98865 0 0.956543 4.02578 0.956543 9C0.956543 13.9679 4.98232 18 9.95654 18Z"
                fill={props.color || '#000000'}
            />
        </G>
        <Defs>
            <ClipPath id="clip0_settings_dark_mode">
                <Rect width={18} height={18} fill="white" />
            </ClipPath>
        </Defs>
    </Svg>
);
