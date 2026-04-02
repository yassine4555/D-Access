import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const AccessibilityTextSizeIcon = (props: SvgProps) => (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none" {...props}>
        <Path
            d="M2.65332 7.90676V5.89342C2.65332 4.53342 3.75999 3.42676 5.11999 3.42676H22.3467C23.7067 3.42676 24.8133 4.53342 24.8133 5.89342V7.90676"
            stroke={props.color || '#111827'}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M13.7334 24.1334V4.42676"
            stroke={props.color || '#111827'}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M9.2002 24.1338H16.6402"
            stroke={props.color || '#111827'}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M18.2402 13.7871H27.5869C28.5602 13.7871 29.3469 14.5738 29.3469 15.5471V16.6138"
            stroke={props.color || '#111827'}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M21.4399 28.5732V14.4932"
            stroke={props.color || '#111827'}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M18.5864 28.5732H24.2931"
            stroke={props.color || '#111827'}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);
