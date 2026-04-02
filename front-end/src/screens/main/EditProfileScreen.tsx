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
import { shared } from '../../constants/sharedStyles';
import { BackIcon } from '../../components/icons/BackIcon';
import { EditProfileEditIcon } from '../../components/icons/EditProfileEditIcon';
import { EditProfileUserIcon } from '../../components/icons/EditProfileUserIcon';
import { SettingsScreenProps } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { AuthRequiredPopup } from '../../components/common/AuthRequiredPopup';
import { pushLoginOnRoot } from '../../navigation/navigationRef';

export default function EditProfileScreen({ navigation }: SettingsScreenProps<'EditProfile'>) {
    const { isAuthenticated } = useAuth();
    const [firstName, setFirstName] = useState('John');
    const [lastName, setLastName] = useState('Doe');
    const [phone, setPhone] = useState('123 456 789');
    const [email, setEmail] = useState('jonhn.ux@gmail.com');
    const [address, setAddress] = useState('216 st Paul rd');
    const [city, setCity] = useState('London');
    const [state, setState] = useState('London');
    const [zipCode, setZipCode] = useState('4511');

    const handleContinueAsGuest = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }
        navigation.navigate('MainTabs');
    };

    const handleLoginOrSignup = () => {
        if (pushLoginOnRoot()) {
            return;
        }
        navigation.navigate('Login');
    };

    if (!isAuthenticated) {
        return (
            <View style={[shared.container, { backgroundColor: '#E9E9E9' }]}>
                <AuthRequiredPopup
                    visible
                    title="Login Required"
                    message="You need to sign in before editing your profile information. It only takes a minute!"
                    onLoginPress={handleLoginOrSignup}
                    onContinueGuestPress={handleContinueAsGuest}
                />
            </View>
        );
    }

    return (
        <View style={[shared.container, styles.screenContainer]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <BackIcon color="#111111" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>Personal Details</Text>

                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrap}>
                        <View style={styles.avatarCircle}>
                            <EditProfileUserIcon />
                        </View>
                        <TouchableOpacity style={styles.editAvatarBtn}>
                            <EditProfileEditIcon />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>First name</Text>
                        <TextInput
                            style={styles.input}
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Last name</Text>
                        <TextInput
                            style={styles.input}
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone</Text>
                        <View style={styles.phoneInputRow}>
                            <TouchableOpacity style={styles.countryPicker}>
                                <Text style={styles.countryText}>+855</Text>
                                <Text style={styles.dropdownArrow}>▼</Text>
                            </TouchableOpacity>
                            <TextInput
                                style={styles.phoneInput}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.changePasswordRow}
                        onPress={() => navigation.navigate('ChangePassword')}
                    >
                        <Text style={styles.changePasswordText}>Change Password</Text>
                    </TouchableOpacity>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            style={styles.input}
                            value={address}
                            onChangeText={setAddress}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City</Text>
                        <TextInput
                            style={styles.input}
                            value={city}
                            onChangeText={setCity}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>State</Text>
                        <TextInput
                            style={styles.input}
                            value={state}
                            onChangeText={setState}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Pine code</Text>
                        <TextInput
                            style={styles.input}
                            value={zipCode}
                            onChangeText={setZipCode}
                            keyboardType="number-pad"
                        />
                    </View>

                    <TouchableOpacity style={styles.saveBtn}>
                        <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <View style={shared.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        backgroundColor: '#F4F4F4',
    },
    header: {
        paddingTop: 52,
        paddingHorizontal: 24,
        paddingBottom: 10,
    },
    backButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
    },
    headerTitle: {
        color: '#101828',
        fontSize: 30,
        lineHeight: 42,
        fontWeight: '700',
        marginBottom: 14,
    },
    scrollContent: {
        paddingHorizontal: 33,
        paddingBottom: 36,
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: 0,
        marginBottom: 16,
    },
    avatarWrap: {
        width: 120,
        height: 120,
        position: 'relative',
    },
    avatarCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#D9D9D9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editAvatarBtn: {
        position: 'absolute',
        right: -8,
        bottom: 8,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E9EAEC',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    form: {
        paddingHorizontal: 0,
    },
    inputGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        color: 'rgba(0,0,0,0.8)',
        marginBottom: 2,
    },
    input: {
        backgroundColor: '#F4F4F4',
        borderWidth: 1,
        borderColor: '#DFDEDE',
        borderRadius: 10,
        height: 52,
        paddingHorizontal: 15,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        color: '#292526',
    },
    phoneInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    countryPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F4F4',
        borderWidth: 1,
        borderColor: '#DFDEDE',
        borderRadius: 10,
        height: 52,
        width: 85,
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    countryText: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        color: '#292526',
        marginRight: 0,
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#292526',
        marginTop: 1,
    },
    phoneInput: {
        flex: 1,
        backgroundColor: '#F4F4F4',
        borderWidth: 1,
        borderColor: '#DFDEDE',
        borderRadius: 10,
        height: 52,
        paddingHorizontal: 15,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        color: '#292526',
    },
    changePasswordRow: {
        alignSelf: 'flex-end',
        marginTop: -2,
        marginBottom: 12,
    },
    changePasswordText: {
        color: '#25A8DF',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        textDecorationLine: 'underline',
    },
    saveBtn: {
        backgroundColor: '#E6E5EA',
        height: 45,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    saveBtnText: {
        color: '#C7C5CD',
        fontWeight: '500',
        fontSize: 16,
        lineHeight: 22,
    },
});
