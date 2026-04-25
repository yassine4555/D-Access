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
  placeName?: string;
  isSelected?: boolean;
  showPlaceName?: boolean;
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

// Layout constants — keep in sync with anchor in MapScreen PlaceMarker:
//   anchor = { x: 0.5, y: PIN_H / TOTAL_H }
export const PIN_MARKER_WIDTH = 80;   // wide enough for label text
export const PIN_MARKER_HEIGHT = 58;  // pin (38) + gap (2) + label (18)
const PIN_H = 38;

export const MapPlacePin = memo(function MapPlacePin({
  wheelchair,
  category,
  placeName,
  isSelected = false,
}: MapPlacePinProps) {
  const visual = MARKER_VISUALS[wheelchair] ?? MARKER_VISUALS.unknown;
  const normalizedPlaceName = placeName?.trim();

  // Name takes priority; fall back to category for unnamed places
  const labelText = normalizedPlaceName || category;
  const isCategoryFallback = !normalizedPlaceName && Boolean(category);

  return (
    <View style={styles.container}>
      {/* Pin icon — 38×38, centered at top */}
      <View style={styles.pinWrap}>
        <LocationPinIcon color={visual.pinColor} width={PIN_H} height={PIN_H} />
        {visual.IconComponent ? (
          <View style={styles.iconCenter}>
            <visual.IconComponent color={visual.iconColor} width={13} height={13} />
          </View>
        ) : null}
      </View>

      {/* Label — directly below pin, entirely within container bounds */}
      <View style={[styles.labelRow, isSelected && styles.labelRowSelected]}>
        {labelText ? (
          <Text
            numberOfLines={1}
            style={[styles.labelText, isCategoryFallback && styles.labelTextCategory]}
          >
            {labelText}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: PIN_MARKER_WIDTH,
    height: PIN_MARKER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pinWrap: {
    width: PIN_H,
    height: PIN_H,
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
  // Label pill — sits in the remaining 20px below the pin, within container
  labelRow: {
    marginTop: 2,
    height: 18,
    maxWidth: PIN_MARKER_WIDTH - 4,
    backgroundColor: 'rgba(17, 24, 39, 0.88)',
    borderRadius: 999,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelRowSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.92)',
  },
  labelText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  labelTextCategory: {
    fontWeight: '500',
    fontStyle: 'italic',
    textTransform: 'capitalize',
    opacity: 0.85,
  },
});
