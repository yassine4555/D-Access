import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    TextInput,
} from 'react-native';
import { colors } from '../../constants/colors';
import { shared, RADIUS, FONT, SPACING } from '../../constants/sharedStyles';
import { SettingsScreenProps } from '../../types/navigation';

export default function ChangePasswordScreen({ navigation }: SettingsScreenProps<'ChangePassword'>) {
    const [oldPassword, setOldPassword] = useState('••••••••');
    const [newPassword, setNewPassword] = useState('••••••••');
    const [confirmPassword, setConfirmPassword] = useState('••••••••');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <View style={shared.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <Text style={styles.title}>Create new password</Text>
                    <Text style={styles.subtitle}>
                        Keep your account secure by creating a strong password
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Old Password</Text>
                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={styles.input}
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                secureTextEntry={!showOld}
                            />
                            <TouchableOpacity
                                style={styles.eyeBtn}
                                onPress={() => setShowOld(!showOld)}
                            >
                                <Text style={styles.eyeIcon}>{showOld ? '👁️' : '👁️‍🗨️'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={styles.input}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNew}
                            />
                            <TouchableOpacity
                                style={styles.eyeBtn}
                                onPress={() => setShowNew(!showNew)}
                            >
                                <Text style={styles.eyeIcon}>{showNew ? '👁️' : '👁️‍🗨️'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirm}
                            />
                            <TouchableOpacity
                                style={styles.eyeBtn}
                                onPress={() => setShowConfirm(!showConfirm)}
                            >
                                <Text style={styles.eyeIcon}>{showConfirm ? '👁️' : '👁️‍🗨️'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.hint}>
                        Your password should be at least contain upper character
                    </Text>

                    <TouchableOpacity style={styles.submitBtn}>
                        <Text style={styles.submitBtnText}>Create new password</Text>
                    </TouchableOpacity>
                </View>

                <View style={shared.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 54,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 32,
        color: colors.gray900,
        fontWeight: '300',
    },
    scrollContent: {
        paddingTop: 0,
    },
    content: {
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.gray900,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: colors.gray500,
        lineHeight: 22,
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '700', // Bold as in design
        color: colors.gray900,
        marginBottom: 10,
    },
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    input: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: RADIUS.lg,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: colors.gray900,
    },
    eyeBtn: {
        position: 'absolute',
        right: 16,
        height: '100%',
        justifyContent: 'center',
    },
    eyeIcon: {
        fontSize: 20,
        color: colors.gray400,
    },
    hint: {
        fontSize: 13,
        color: colors.gray400,
        marginTop: -8,
        marginBottom: 32,
    },
    submitBtn: {
        backgroundColor: '#4EAFD0', // Match design blue
        paddingVertical: 16,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
    },
    submitBtnText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: 16,
    },
});
