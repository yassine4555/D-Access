import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Modal, FlatList, StyleSheet, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../../services/api';
import { colors } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Checkbox } from '../../components/common/Checkbox';
import { BackIcon } from '../../components/icons/BackIcon';
import { EyeIcon } from '../../components/icons/EyeIcon';
import { CaretDownIcon } from '../../components/icons/CaretDownIcon';

/* ---------- COUNTRY LIST ---------- */
const COUNTRY_CODES = [
  { code: '+216', country: 'Tunisia' },
  { code: '+212', country: 'Morocco' },
  { code: '+213', country: 'Algeria' },
  { code: '+33', country: 'France' },
  { code: '+1', country: 'USA' },
];

/* ---------- SCREEN ---------- */
export default function SignupScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+216');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return;
    }

    try {
      setLoading(true);

      const fullName = `${firstName} ${lastName}`;
      await authApi.register(email, password, fullName);

      const response = await authApi.login(email, password);
      const { access_token } = response.data;

      await SecureStore.setItemAsync('userToken', access_token);
      navigation.replace('MainTabs');

    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Registration failed';
      Alert.alert('Error', Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>

        {/* HEADER */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.floatingButton, { position: 'absolute', top: 10, right: 16, zIndex: 10 }]}>
          <BackIcon color={colors.gray900} />
        </TouchableOpacity>
         <View style={{ marginTop: 40 }}> 
           <Text style={styles.headerTitle}>
             Create account
           </Text>

           <Text style={{ color: colors.gray600, marginBottom: 24 }}>
             Get the best of the app by creating an account
           </Text>
          </View>

        {/* FIRST NAME */}
        <Input
          label="First name"
          placeholder="John"
          value={firstName}
          onChangeText={setFirstName}
        />

        {/* LAST NAME */}
        <Input
          label="Last name"
          placeholder="Doe"
          value={lastName}
          onChangeText={setLastName}
        />

        {/* PHONE */}
        <Text style={{ color: colors.gray900, marginBottom: 6 }}>Phone</Text>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setShowCountryPicker(true)}
            style={[styles.countryPickerButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minWidth: 80 }]}
          >
            <Text style={{ marginRight: 4, color: colors.gray900 }}>{countryCode}</Text>
            <CaretDownIcon width={12} height={12} color={colors.gray900} />
          </TouchableOpacity>

          <Input
            containerStyle={{ flex: 1, marginBottom: 0 }}
            placeholder="123 456 789"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* EMAIL */}
        <Input
          label="Email"
          placeholder="example@email.com"
          value={email}
          onChangeText={setEmail}
        />

        {/* PASSWORD */}
        <Text style={{ color: colors.gray900, marginBottom: 6, fontWeight: '600' }}>
          Password
        </Text>
        <View
          style={styles.passwordContainer}
        >
          <Input
            containerStyle={{ flex: 1, marginBottom: 0 }}
            style={{ borderWidth: 0 }}
            placeholder="Enter your password"
            placeholderTextColor={colors.gray400}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 12 }}>
            <EyeIcon color={colors.gray500} />
          </TouchableOpacity>
        </View>

        {/* TERMS */}
        <Checkbox
          checked={acceptTerms}
          onPress={() => setAcceptTerms(!acceptTerms)}
          label="I accept terms and conditions"
        />

        {/* BUTTON */}
        <Button
          title="Create Account"
          loading={loading}
          disabled={!acceptTerms}
          onPress={handleSignup}
          style={{ marginTop: 24 }}
        />

        {/* LOGIN LINK */}
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              Already have an account? Log in
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* COUNTRY MODAL */}
      <Modal visible={showCountryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setCountryCode(item.code);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text>{item.country} ({item.code})</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 floatingButton: {
  backgroundColor: '#fff',       // make sure button has background
  padding: 10,
  borderRadius: 25,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,
  elevation: 5,                  // for Android
},
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.gray900,
    marginTop: 8,
  },
  countryPickerButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  passwordContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
});