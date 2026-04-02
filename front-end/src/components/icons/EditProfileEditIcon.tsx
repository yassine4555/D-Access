import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export const EditProfileEditIcon = (props: SvgProps) => (
  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none" {...props}>
    <Path
      d="M11.25 4.49977L13.5 6.74977M9.75 14.9998H15.75M3.75 11.9998L3 14.9998L6 14.2498L14.6895 5.56027C14.9707 5.27898 15.1287 4.89752 15.1287 4.49977C15.1287 4.10203 14.9707 3.72056 14.6895 3.43927L14.5605 3.31027C14.2792 3.02907 13.8977 2.87109 13.5 2.87109C13.1023 2.87109 12.7208 3.02907 12.4395 3.31027L3.75 11.9998Z"
      stroke={props.color || '#25A8DF'}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
