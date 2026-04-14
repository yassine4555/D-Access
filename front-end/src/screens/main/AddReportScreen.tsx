import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { colors } from '../../constants/colors';
import { BackIcon } from '../../components/icons/BackIcon';
import { MapScreenProps } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { AuthRequiredPopup } from '../../components/common/AuthRequiredPopup';
import { ReportSubmittedPopup } from '../../components/common/ReportSubmittedPopup';
import { pushLoginOnRoot } from '../../navigation/navigationRef';
import { placesApi } from '../../services/api';

type ReportType = 'incorrect' | 'elevator' | 'ramp' | 'parking' | 'closed' | 'other' | null;

const REPORT_OPTIONS = [
    {
        id: 'incorrect',
        title: 'Incorrect Accessibility Info',
        description: 'Features listed don\'t match reality',
        icon: '⚠️',
    },
    {
        id: 'elevator',
        title: 'Elevator Out of Order',
        description: 'Elevator is not working properly',
        icon: '↕️',
    },
    {
        id: 'ramp',
        title: 'Ramp Blocked',
        description: 'Ramp or entrance is obstructed',
        icon: '⛔',
    },
    {
        id: 'parking',
        title: 'Parking Issue',
        description: 'Accessible parking unavailable or blocked',
        icon: '🅿️',
    },
    {
        id: 'closed',
        title: 'Place Closed',
        description: 'Business is temporarily or permanently closed',
        icon: '📍',
    },
    {
        id: 'other',
        title: 'Other Issue',
        description: 'Something else needs attention',
        icon: '⋯',
    },
];

export default function AddReportScreen({ navigation, route }: MapScreenProps<'AddReport'>) {
    const { isAuthenticated } = useAuth();
    const [selectedReport, setSelectedReport] = useState<ReportType>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmittedPopup, setShowSubmittedPopup] = useState(false);

    const place = route?.params?.place;
    const placeId = place?.id;

    const issueTypeMap: Record<Exclude<ReportType, null>, 'incorrect_info' | 'elevator_out_of_order' | 'ramp_blocked' | 'parking_issue' | 'place_closed' | 'other'> = {
        incorrect: 'incorrect_info',
        elevator: 'elevator_out_of_order',
        ramp: 'ramp_blocked',
        parking: 'parking_issue',
        closed: 'place_closed',
        other: 'other',
    };

    const handleSubmit = async () => {
        if (!placeId) {
            Alert.alert('Cannot submit', 'Missing place information for this report.');
            return;
        }

        if (!selectedReport) {
            Alert.alert('Select report type', 'Please choose the issue type before submitting.');
            return;
        }

        try {
            setIsSubmitting(true);
            await placesApi.createReport(placeId, {
                issueType: issueTypeMap[selectedReport],
                description: description.trim() || undefined,
            });
            setShowSubmittedPopup(true);
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to submit report. Please try again.';

            Alert.alert('Submission failed', Array.isArray(message) ? message[0] : message);
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const handleCloseSubmittedPopup = () => {
        setShowSubmittedPopup(false);
        navigation.navigate('PlaceDetails', {
            place,
            refreshToken: Date.now(),
        });
    };

    if (!isAuthenticated) {
        return (
            <View style={[styles.container, { backgroundColor: '#E9E9E9' }]}>
                <AuthRequiredPopup
                    visible
                    title="Login Required to Post"
                    message="To ensure the safety and accuracy of our community data, you must be signed in to post a report. It only takes a minute!"
                    onLoginPress={handleLoginOrSignup}
                    onContinueGuestPress={handleContinueAsGuest}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <ReportSubmittedPopup
                visible={showSubmittedPopup}
                onClose={handleCloseSubmittedPopup}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.floatingButton}>
                    <BackIcon color={colors.gray900} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} onPress={() => void handleSubmit()} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="#F4F3F5" /> : <Text style={styles.submitBtnText}>Submit</Text>}
                </TouchableOpacity>
            </View>
                
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Icon Section */}
                <View style={styles.iconSection}>
                    <View style={styles.iconWrapper}>
                        <Text style={styles.iconText}>🚩</Text>
                    </View>
                </View>

                {/* Title and Description */}
                <Text style={styles.title}>Help Keep Information Accurate</Text>
                <Text style={styles.subtitle}>Your report helps the community stay informed about accessibility changes</Text>

                {/* Map Preview */}
                <View style={styles.mapPreview}>
                    <View style={styles.mapPlaceholder}>
                        <Text style={{ fontSize: 32 }}>🗺️</Text>
                    </View>
                    <TouchableOpacity style={styles.expandBtn}>
                        <Text style={{ fontSize: 14 }}>⛶</Text>
                    </TouchableOpacity>
                </View>
             
                <Text style={styles.addressText}>{place?.name || 'Selected place'}</Text>
                <Text style={styles.distanceText}>{placeId ? `Place ID: ${placeId}` : 'Missing place id'}</Text>

                {/* Report Options */}
                {REPORT_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={styles.reportOption}
                        onPress={() => setSelectedReport(option.id as ReportType)}
                    >
                        <View style={styles.radioButton}>
                            {selectedReport === option.id && (
                                <View style={styles.radioSelected} />
                            )}
                        </View>
                        <Text style={styles.reportIcon}>{option.icon}</Text>
                        <View style={styles.reportContent}>
                            <Text style={styles.reportTitle}>{option.title}</Text>
                            <Text style={styles.reportDescription}>{option.description}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Additional Details */}
                <Text style={styles.additionalLabel}>Additional Details (Optional)</Text>
                <Text style={styles.additionalHint}>Keep it respectful and factual</Text>
                <View style={styles.descriptionBox}>
                    <TextInput
                        style={styles.descriptionInput}
                        placeholder="Describe the issue…"
                        placeholderTextColor={colors.gray900}
                        multiline
                        value={description}
                        onChangeText={setDescription}
                        textAlignVertical="top"
                    />
                </View>

                {/* Photos */}
                <Text style={styles.photosLabel}>Photos</Text>
                <TouchableOpacity style={styles.photoUpload}>
                    <Text style={styles.downloadIcon}>⬇</Text>
                    <Text style={styles.photoUploadText}>Click or drop image</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    floatingButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    submitBtn: {
        backgroundColor: '#4AAFD9',
        paddingHorizontal: 28,
        paddingVertical: 10,
        borderRadius: 10,
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: '#F4F3F5',
        fontWeight: '600',
        fontSize: 14,
        fontFamily: 'Poppins',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    // Icon Section
    iconSection: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    iconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 10,
        backgroundColor: '#BAE6FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 64,
    },
    // Title & Description
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.gray900,
        textAlign: 'center',
        marginBottom: 12,
        fontFamily: 'Poppins',
        lineHeight: 28,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.gray900,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Poppins',
        lineHeight: 22,
    },
    // Map
    mapPreview: {
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#E5F0E5',
        marginBottom: 12,
        position: 'relative',
    },
    mapPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    expandBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 30,
        height: 30,
        borderRadius: 6,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.gray900,
        marginBottom: 4,
        fontFamily: 'Poppins',
    },
    distanceText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.gray900,
        marginBottom: 24,
        fontFamily: 'Poppins',
    },
    // Report Options
    reportOption: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#DFDEDE',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 12,
        gap: 12,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#919191',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    radioSelected: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#919191',
    },
    reportIcon: {
        fontSize: 24,
        width: 24,
        textAlign: 'center',
    },
    reportContent: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.gray900,
        marginBottom: 4,
        fontFamily: 'Poppins',
    },
    reportDescription: {
        fontSize: 16,
        fontWeight: '400',
        color: '#333',
        fontFamily: 'Poppins',
    },
    // Additional Details
    additionalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.gray900,
        marginTop: 20,
        marginBottom: 8,
        fontFamily: 'Poppins',
    },
    additionalHint: {
        fontSize: 16,
        fontWeight: '400',
        color: '#4B5563',
        marginBottom: 12,
        fontFamily: 'Poppins',
    },
    descriptionBox: {
        borderWidth: 1,
        borderColor: '#D4D4D4',
        borderRadius: 10,
        marginBottom: 20,
        padding: 12,
        minHeight: 118,
        backgroundColor: colors.white,
    },
    descriptionInput: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.gray900,
        minHeight: 100,
        paddingVertical: 0,
        fontFamily: 'Poppins',
    },
    // Photos
    photosLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.gray900,
        marginBottom: 12,
        fontFamily: 'Poppins',
    },
    photoUpload: {
        height: 200,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        borderWidth: 1,
        borderColor: '#D4D4D4',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    downloadIcon: {
        fontSize: 24,
        color: colors.gray400,
    },
    photoUploadText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#303030',
        fontFamily: 'Poppins',
    },
});
