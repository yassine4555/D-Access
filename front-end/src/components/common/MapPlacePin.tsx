import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { colors } from '../../constants/colors';
import { WheelchairAccessibility } from '../../types/place';
import { AccessiblePinIcon } from '../icons/AccessiblePinIcon';
import { InaccessiblePinIcon } from '../icons/InaccessiblePinIcon';
import { LocationPinIcon } from '../icons/LocationPinIcon';
import { PartiallyAccessiblePinIcon } from '../icons/PartiallyAccessiblePinIcon';

type MapPlacePinProps = {
  wheelchair: WheelchairAccessibility;
  category?: string;
  isSelected?: boolean;
};

type MarkerVisualConfig = {
  pinColor: string;
  iconColor: string;
  IconComponent?: React.ComponentType<SvgProps>;
};

const MARKER_VISUALS: Record<WheelchairAccessibility, MarkerVisualConfig> = {
  yes: {
    pinColor: colors.accessibilityYes,
    iconColor: colors.white,
    IconComponent: AccessiblePinIcon,
  },
  no: {
    pinColor: colors.accessibilityNo,
    iconColor: colors.white,
    IconComponent: InaccessiblePinIcon,
  },
  limited: {
    pinColor: colors.accessibilityLimited,
    iconColor: colors.white,
    IconComponent: PartiallyAccessiblePinIcon,
  },
  unknown: {
    pinColor: colors.accessibilityUnknown,
    iconColor: colors.white,
  },
};

export function getWheelchairPinColor(wheelchair: WheelchairAccessibility): string {
  return (MARKER_VISUALS[wheelchair] ?? MARKER_VISUALS.unknown).pinColor;
}

export const MapPlacePin = memo(function MapPlacePin({
  wheelchair,
  category,
  isSelected = false,
}: MapPlacePinProps) {
  const visual = MARKER_VISUALS[wheelchair] ?? MARKER_VISUALS.unknown;

  return (
    <View style={styles.container}>
      {isSelected && category ? (
        <View pointerEvents="none" style={styles.categoryBadge}>
          <Text numberOfLines={1} style={styles.categoryText}>
            {category}
          </Text>
        </View>
      ) : null}
      <View style={styles.pinWrap}>
        <LocationPinIcon color={visual.pinColor} width={38} height={38} />
        {visual.IconComponent ? (
          <View style={styles.iconCenter}>
            <visual.IconComponent color={visual.iconColor} width={13} height={13} />
          </View>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 36,
    minWidth: 56,
    maxWidth: 132,
    backgroundColor: colors.gray900,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    zIndex: 2,
  },
  categoryText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  pinWrap: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCenter: {
    position: 'absolute',
    top: 11,
    left: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
