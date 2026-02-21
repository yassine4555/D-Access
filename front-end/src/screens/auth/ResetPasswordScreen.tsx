import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

export default function ResetPasswordScreen({ navigation, route }: any) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const email = route?.params?.email || '';

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            // TODO: Implement password reset API call
            // await authApi.resetPassword(email, newPassword);
            
            Alert.alert('Success', 'Password reset successfully', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('Login')
                }
            ]);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to reset password');
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

                <Text className="text-2xl font-bold text-gray-800 mb-2">Create new password</Text>
                <Text className="text-gray-500">
                    Keep your account secure by creating a strong password
                </Text>
            </View>

            <View className="flex-1 px-6">
                {/* New Password Input */}
                <View className="mb-6">
                    <View className="relative">
                        <TextInput
                            className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
                            placeholder="Enter new password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showPassword}
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TouchableOpacity
                            className="absolute right-4 top-3"
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Text className="text-gray-500">{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Confirm Password Input */}
                <View className="mb-6">
                    <TextInput
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
                        placeholder="Confirm new password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </View>

                {/* Create Password Button */}
                <TouchableOpacity
                    className="w-full bg-cyan-500 py-4 rounded-lg items-center"
                    onPress={handleResetPassword}
                    disabled={loading}
                    style={{ opacity: loading ? 0.6 : 1 }}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-semibold text-base">Create new password</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
