import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { authApi } from '../../services/api';
import { RootScreenProps } from '../../types/navigation';

export default function ForgotPasswordScreen({ navigation }: RootScreenProps<'ForgotPassword'>) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestCode = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        try {
            setLoading(true);
            const res = await authApi.forgotPassword(email);
            Alert.alert('Success', 'A reset code has been sent to your email.');
            navigation.navigate('ResetPassword', { email });
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error?.response?.data?.message ?? 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Forgot password</Text>
                <Text style={styles.subtitle}>
                    Enter your email or phone we will send the verification code to reset your password
                </Text>
            </View>

            <View style={styles.body}>
                {/* Email Input */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="john.vue@gmail.com"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                {/* Request Code Button */}
                <TouchableOpacity
                    style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
                    onPress={handleRequestCode}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Request code</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        paddingTop: 48,
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    backButton: {
        marginBottom: 24,
    },
    backArrow: {
        fontSize: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        color: '#6b7280',
        lineHeight: 22,
    },
    body: {
        flex: 1,
        paddingHorizontal: 24,
    },
    inputWrapper: {
        marginBottom: 24,
    },
    input: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        fontSize: 16,
        color: '#111827',
    },
    button: {
        width: '100%',
        backgroundColor: '#06b6d4',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
});
