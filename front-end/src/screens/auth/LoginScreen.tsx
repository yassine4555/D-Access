import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../../services/api';
import { colors } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const response = await authApi.login(email, password);
            const { access_token } = response.data;

            // Save token securely
            await SecureStore.setItemAsync('userToken', access_token);

            // Navigate to main app
            navigation.replace('MainTabs');
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Login failed';
            Alert.alert('Error', Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Welcome to Discover</Text>
                <Text style={styles.subtitle}>Please choose your login option below</Text>
            </View>

            <View style={styles.formContainer}>
                {/* Email Input */}
                <Input
                    label="Email"
                    placeholder="Enter your email address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                {/* Password Input */}
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                    <Input
                        containerStyle={{ flex: 1, marginBottom: 0 }}
                        style={{ borderWidth: 0 }}
                        placeholder="Enter your password"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Text style={{ color: colors.gray500 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => navigation.navigate('ForgotPassword')}
                >
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <Button
                    title="Login"
                    onPress={handleLogin}
                    loading={loading}
                    style={[styles.loginButton, { backgroundColor: colors.cyan500 }]}
                />

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or login with</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Social Login Buttons */}
                <View style={styles.socialContainer}>
                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.blue600 }]}>
                        <Text style={styles.socialButtonText}>f</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.red500 }]}>
                        <Text style={styles.socialButtonText}>G</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: 'black' }]}>
                        <Text style={styles.socialButtonText}></Text>
                    </TouchableOpacity>
                </View>

                {/* Create Account Link */}
                <View style={styles.createAccountContainer}>
                    <Text style={styles.createAccountText}>Don't have account yet? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.createAccountLink}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        alignItems: 'center',
        paddingTop: 64, // pt-16
        paddingBottom: 32, // pb-8
    },
    title: {
        fontSize: 24, // text-2xl
        fontWeight: 'bold', // font-bold
        color: colors.gray800,
        marginBottom: 8, // mb-2
    },
    subtitle: {
        color: colors.gray500,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 24, // px-6
    },
    label: {
        color: colors.gray700,
        marginBottom: 8, // mb-2
    },
    passwordContainer: {
        marginBottom: 8, // mb-2
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    eyeIcon: {
        padding: 12,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24, // mb-6
    },
    forgotPasswordText: {
        color: colors.cyan500,
        fontSize: 14, // text-sm
    },
    loginButton: {
        width: '100%',
        marginBottom: 24, // mb-6
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24, // mb-6
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.gray300,
    },
    dividerText: {
        marginHorizontal: 16, // mx-4
        color: colors.gray500,
        fontSize: 14, // text-sm
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24, // mb-6
        gap: 16, // space-x-4
    },
    socialButton: {
        width: 64, // w-16
        height: 64, // h-16
        borderRadius: 8, // rounded-lg
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8, // gap replacement for older RN
    },
    socialButtonText: {
        color: colors.white,
        fontSize: 20, // text-xl
    },
    createAccountContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    createAccountText: {
        color: colors.gray600,
    },
    createAccountLink: {
        color: colors.cyan500,
        fontWeight: '600', // font-semibold
    },
});
