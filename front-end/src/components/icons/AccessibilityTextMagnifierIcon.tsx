import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const AccessibilityTextMagnifierIcon = (props: SvgProps) => (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none" {...props}>
        <Path
            d="M14.6665 26.667C21.2939 26.667 26.6665 21.2944 26.6665 14.667C26.6665 8.03958 21.2939 2.66699 14.6665 2.66699C8.03909 2.66699 2.6665 8.03958 2.6665 14.667C2.6665 21.2944 8.03909 26.667 14.6665 26.667Z"
            stroke={props.color || '#111827'}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M11.3335 14.667H18.0002"
            stroke={props.color || '#111827'}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M14.6665 17.9997V11.333"
            stroke={props.color || '#111827'}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M25.2397 27.5867C25.9464 29.7201 27.5597 29.9334 28.7997 28.0667C29.9331 26.3601 29.1864 24.9601 27.1331 24.9601C25.6131 24.9467 24.7597 26.1334 25.2397 27.5867Z"
            stroke={props.color || '#111827'}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);
