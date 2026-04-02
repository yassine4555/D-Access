import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertCircleIcon } from '../icons/AlertCircleIcon';

interface SignOutPopupProps {
  visible: boolean;
  onConfirmLogOut: () => void;
  onCancel: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(328, SCREEN_WIDTH - 62);

export function SignOutPopup({ visible, onConfirmLogOut, onCancel }: SignOutPopupProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.contentWrap}>
            <View style={styles.iconCircle}>
              <AlertCircleIcon />
            </View>

            <Text style={styles.title}>Sign Out?</Text>
            <Text style={styles.message}>
              Are you sure you want to log out? You will need your password to sign back in.
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={onConfirmLogOut}>
            <Text style={styles.primaryText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9} onPress={onCancel}>
            <Text style={styles.secondaryText}>Stay Logged In</Text>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF0C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#101828',
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '500',
  },
  message: {
    color: '#344054',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  primaryButton: {
    height: 45,
    borderRadius: 10,
    backgroundColor: '#4AAFD9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  secondaryButton: {
    height: 45,
    borderRadius: 10,
    backgroundColor: '#E6F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  secondaryText: {
    color: '#4AAFD9',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
});
