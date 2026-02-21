import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    StatusBar,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { colors } from '../../constants/colors';
import { BackIcon } from '../../components/icons/BackIcon';

export default function WriteReviewScreen({ navigation, route }: any) {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const place = route?.params?.place;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Hero Background */}
            <Image
                source={{
                    uri: place?.image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=200&fit=crop',
                }}
                style={styles.heroImage}
            />

            {/* Back Button */}
           <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.floatingButton, { position: 'absolute', top: 45, left: 16, zIndex: 10 }]}>
                                                                                             <BackIcon color={colors.gray900} />
                 </TouchableOpacity>

            {/* Bottom Sheet */}
            <KeyboardAvoidingView
                style={styles.sheetContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Handle */}
                <View style={styles.handleRow}>
                    <View style={styles.handle} />
                </View>

                <Text style={styles.title}>Write a review</Text>

                {/* Star Rating */}
                <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Text style={[styles.star, star <= rating && styles.starActive]}>
                                {star <= rating ? '★' : '☆'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={styles.tapHint}>Tap a star to rate</Text>

                {/* Text Area */}
                <View style={styles.textAreaContainer}>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Share details of your own experience at this place"
                        placeholderTextColor={colors.gray400}
                        multiline
                        value={reviewText}
                        onChangeText={setReviewText}
                        textAlignVertical="top"
                    />
                </View>

                <View style={{ flex: 1 }} />

                {/* Submit */}
                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.submitBtnText}>Submit</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    heroImage: {
        width: '100%',
        height: '30%',
    },
    backBtn: {
        position: 'absolute',
        top: 50,
        left: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetContainer: {
        flex: 1,
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
        paddingHorizontal: 24,
    },
    handleRow: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 16,
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
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.gray300,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.gray900,
        textAlign: 'center',
        marginBottom: 20,
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 8,
    },
    star: {
        fontSize: 36,
        color: colors.gray300,
    },
    starActive: {
        color: '#F59E0B',
    },
    tapHint: {
        textAlign: 'center',
        fontSize: 13,
        color: colors.gray500,
        marginBottom: 24,
    },
    textAreaContainer: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: 12,
        padding: 14,
        minHeight: 140,
    },
    textArea: {
        fontSize: 14,
        color: colors.gray800,
        minHeight: 120,
    },
    submitBtn: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    submitBtnText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 16,
    },
});
