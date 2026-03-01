import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    TextInput,
    Image,
    Dimensions,
} from 'react-native';
import { colors } from '../../constants/colors';
import { shared, RADIUS, FONT, SPACING } from '../../constants/sharedStyles';
import { BackIcon } from '../../components/icons/BackIcon';
import { SettingsScreenProps } from '../../types/navigation';

const { width } = Dimensions.get('window');

export default function EditProfileScreen({ navigation }: SettingsScreenProps<'EditProfile'>) {
    const [firstName, setFirstName] = useState('John');
    const [lastName, setLastName] = useState('Doe');
    const [phone, setPhone] = useState('123 456 789');
    const [email, setEmail] = useState('jonhn.ux@gmail.com');
    const [address, setAddress] = useState('216 st Paul rd');
    const [city, setCity] = useState('London');
    const [state, setState] = useState('London');
    const [zipCode, setZipCode] = useState('4511');

    return (
        <View style={shared.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.floatingButton, { position: 'absolute', top: 5, left: 16, zIndex: 10 }]}>
                                <BackIcon color={colors.gray900} />
               </TouchableOpacity>
                <Text style={styles.headerTitle}>Personal Details</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Picture */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarCircle}>
                        <Text style={{ fontSize: 40, color: colors.gray400 }}>👤</Text>
                    </View>
                    <TouchableOpacity style={styles.editAvatarBtn}>
                        <Text style={styles.editAvatarIcon}>✎</Text>
                    </TouchableOpacity>
                </View>

                {/* Form */}
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
                                style={[styles.input, { flex: 1, marginLeft: 12 }]}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    headerTitle: {
        fontSize: FONT.title,
        fontWeight: '800',
        color: colors.gray900,
    },
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
    scrollContent: {
        paddingTop: SPACING.md,
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
        position: 'relative',
    },
    avatarCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: (width / 2) - 60,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.gray200,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    editAvatarIcon: {
        fontSize: 18,
        color: '#4EAFD0',
    },
    form: {
        paddingHorizontal: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.gray700,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: RADIUS.lg,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: colors.gray900,
    },
    phoneInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: RADIUS.lg,
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    countryText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.gray900,
        marginRight: 4,
    },
    dropdownArrow: {
        fontSize: 10,
        color: colors.gray600,
    },
    changePasswordRow: {
        alignSelf: 'flex-end',
        marginVertical: 8,
    },
    changePasswordText: {
        color: '#4EAFD0',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    saveBtn: {
        backgroundColor: colors.gray100,
        paddingVertical: 16,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        marginTop: 20,
    },
    saveBtnText: {
        color: colors.gray400,
        fontWeight: '700',
        fontSize: 16,
    },
});
