import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { RootScreenProps } from '../../types/navigation';

export default function WelcomeScreen({ navigation }: RootScreenProps<'Welcome'>) {
  return (
    <LinearGradient
      colors={[colors.cyan500, colors.blue500]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />



        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Top circular element */}
          <View style={styles.circleElement} />

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../../assets/welcome-icon.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <Text style={styles.heading}>
              Navigate your world with confidence
            </Text>
            <Text style={styles.subtext}>
              Find accessible places, shop for mobility aids, and get expert health advice all in one place
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Signup')}
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleElement: {
    width: 64,
    height: 64,
    backgroundColor: colors.gray300,
    borderRadius: 32,
    marginBottom: 32,
    alignSelf: 'flex-start',
    opacity: 0.8,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  illustration: {
    width: 256,
    height: 256,
  },
  textContent: {
    width: '100%',
    marginBottom: 32,
    alignItems: 'center',
  },
  heading: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 42,
  },
  subtext: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.9,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: colors.cyan200,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: colors.sky700,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  secondaryButtonText: {
    color: colors.cyan500,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
