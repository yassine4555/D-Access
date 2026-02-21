import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

export default function ForgotPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestCode = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        try {
            setLoading(true);
            // TODO: Implement password reset API call
            // await authApi.requestPasswordReset(email);
            
            // For now, just navigate to reset password screen
            Alert.alert('Success', 'Password reset code sent to your email');
            navigation.navigate('ResetPassword', { email });
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="pt-12 px-6 mb-8">
                <TouchableOpacity 
                    className="mb-6"
                    onPress={() => navigation.goBack()}
                >
                    <Text className="text-2xl">←</Text>
                </TouchableOpacity>

                <Text className="text-2xl font-bold text-gray-800 mb-2">Forgot password</Text>
                <Text className="text-gray-500">
                    Enter your email or phone we will send the verification code to reset your password
                </Text>
            </View>

            <View className="flex-1 px-6">
                {/* Email Input */}
                <View className="mb-6">
                    <TextInput
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
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
                    className="w-full bg-cyan-500 py-4 rounded-lg items-center"
                    onPress={handleRequestCode}
                    disabled={loading}
                    style={{ opacity: loading ? 0.6 : 1 }}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-semibold text-base">Request code</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
