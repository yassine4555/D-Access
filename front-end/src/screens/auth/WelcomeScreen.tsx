import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootScreenProps } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_MARGIN = 35;
const CONTENT_WIDTH = Math.min(320, SCREEN_WIDTH - HORIZONTAL_MARGIN * 2);
const ILLUSTRATION_WIDTH = Math.min(SCREEN_WIDTH * 1.09, 437);
const ILLUSTRATION_HEIGHT = ILLUSTRATION_WIDTH * 0.96;

export default function WelcomeScreen({ navigation }: RootScreenProps<'Welcome'>) {
    const { setGuestEntry } = useAuth();
  
    const handleGetStarted = () => {
      setGuestEntry(true);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    };

  return (
    <LinearGradient
      colors={['#0FA3E2', '#49C9FF']}
      locations={[0.629, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.mainContent}>
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../../assets/welcome-icon.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          <LinearGradient
            colors={[
              'rgba(14, 163, 226, 0.08)',
              'rgba(14, 163, 226, 0.8)',
              'rgba(51, 138, 174, 0.8)',
              'rgba(115, 115, 115, 0)',
            ]}
            locations={[0.058, 0.42, 0.611, 1]}
            style={styles.bottomGlow}
            pointerEvents="none"
          />

          <View style={[styles.textContent, { width: CONTENT_WIDTH }]}>
            <Text style={styles.heading}>
              Navigate your world{"\n"}with confidence
            </Text>
            <Text style={styles.subtext}>
              Find accessible places, shop for mobility aids, and get expert health advice all in one place
            </Text>
          </View>

          <View style={[styles.buttonsContainer, { width: CONTENT_WIDTH }]}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 28,
    alignItems: 'center',
  },
  illustrationContainer: {
    width: ILLUSTRATION_WIDTH,
    height: ILLUSTRATION_HEIGHT,
    marginTop: 18,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: ILLUSTRATION_WIDTH,
    height: ILLUSTRATION_HEIGHT,
    transform: [{ rotate: '-1.74deg' }],
  },
  bottomGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 584,
  },
  textContent: {
    marginTop: 'auto',
    marginBottom: 28,
    alignItems: 'flex-start',
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 14,
    textAlign: 'left',
    lineHeight: 34,
  },
  subtext: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.98,
    fontWeight: '500',
    textAlign: 'left',
  },
  buttonsContainer: {
    marginBottom: 6,
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#4AAFD9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#F4F3F5',
    fontWeight: '500',
    fontSize: 16,
    textAlign: 'center',
  },
  secondaryButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#E6F8FF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#4AAFD9',
    fontWeight: '500',
    fontSize: 16,
    textAlign: 'center',
  },
});
