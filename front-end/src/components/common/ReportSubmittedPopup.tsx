import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProfileSavedCheckCircleIcon } from '../icons/ProfileSavedCheckCircleIcon';

interface ReportSubmittedPopupProps {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(328, SCREEN_WIDTH - 62);

export function ReportSubmittedPopup({ visible, onClose }: ReportSubmittedPopupProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.contentWrap}>
            <View style={styles.iconCircle}>
              <ProfileSavedCheckCircleIcon />
            </View>

            <Text style={styles.title}>Report Submitted</Text>
            <Text style={styles.message}>
              Thank you! Your update helps the community stay informed about local accessibility.
            </Text>
          </View>

          <TouchableOpacity style={styles.closeButton} activeOpacity={0.9} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(233, 233, 233, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 24,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  contentWrap: {
    width: '100%',
    marginBottom: 32,
    gap: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FADF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#101828',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500',
  },
  message: {
    color: '#344054',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  closeButton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#4AAFD9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
