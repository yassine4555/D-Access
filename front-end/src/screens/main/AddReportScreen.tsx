import React, { useState } from 'react';
import {
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

const CATEGORIES = ['Not accessible', 'Partially accessible', 'Accessible'];

export default function AddReportScreen({ navigation }: MapScreenProps<'AddReport'>) {
    const [category, setCategory] = useState('Not accessible');
    const [showDropdown, setShowDropdown] = useState(false);
    const [tags, setTags] = useState<string[]>(['Steps']);
    const [tagInput, setTagInput] = useState('');
    const [description, setDescription] = useState('');

    const addTag = () => {
        if (tagInput.trim()) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.floatingButton, { position: 'absolute', top: 45, left: 16, zIndex: 10 }]}>
                        <BackIcon color={colors.gray900} />
                 </TouchableOpacity>
                <TouchableOpacity style={[styles.submitBtn, { position: 'absolute', top: 45, right: 16, zIndex: 10 }]}>
                    <Text style={styles.submitBtnText}>Submit</Text>
                </TouchableOpacity>
            </View>
                
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Map Preview */}
            <View style={{ marginTop: 40 }}>
                <View style={styles.mapPreview}>
                    <View style={styles.mapPlaceholder}>
                        <Text style={{ fontSize: 32 }}>🗺️</Text>
                    </View>
                    <TouchableOpacity style={styles.expandBtn}>
                        <Text style={{ fontSize: 14 }}>⛶</Text>
                    </TouchableOpacity>
                </View>
            </View>
             
                <Text style={styles.addressText}>123 Main St, San Francisco, CA 94103</Text>
                <Text style={styles.distanceText}>350 ft from your location   ✏️</Text>

                {/* Category */}
                <Text style={styles.label}>Category</Text>
                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowDropdown(!showDropdown)}
                >
                    <Text style={styles.dropdownText}>{category}</Text>
                    <Text style={styles.dropdownArrow}>▾</Text>
                </TouchableOpacity>

                {showDropdown && (
                    <View style={styles.dropdownList}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setCategory(cat);
                                    setShowDropdown(false);
                                }}
                            >
                                <Text style={[
                                    styles.dropdownItemText,
                                    cat === category && { color: colors.primary, fontWeight: '600' },
                                ]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Tags */}
                <View style={styles.tagsContainer}>
                    {tags.map((tag, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.tagChip}
                            onPress={() => removeTag(idx)}
                        >
                            <Text style={styles.tagChipText}>{tag}</Text>
                            <Text style={styles.tagChipX}>  ×</Text>
                        </TouchableOpacity>
                    ))}
                    <TextInput
                        style={styles.tagInput}
                        placeholder="Enter tags to describe the situation"
                        placeholderTextColor={colors.gray400}
                        value={tagInput}
                        onChangeText={setTagInput}
                        onSubmitEditing={addTag}
                    />
                </View>

                {/* Description */}
                <View style={styles.descriptionBox}>
                    <TextInput
                        style={styles.descriptionInput}
                        placeholder="Describe the issue..."
                        placeholderTextColor={colors.gray400}
                        multiline
                        value={description}
                        onChangeText={setDescription}
                        textAlignVertical="top"
                    />
                </View>

                {/* Photos */}
                <Text style={styles.label}>Photos</Text>
                <TouchableOpacity style={styles.photoUpload}>
                    <Text style={{ fontSize: 24, color: colors.gray400, marginBottom: 4 }}>⬇</Text>
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
    backBtn: {
        fontSize: 28,
        color: colors.gray700,
    },
    submitBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
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
    submitBtnText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    // Map
    mapPreview: {
        height: 200,
        borderRadius: 16,
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
        fontSize: 15,
        fontWeight: '600',
        color: colors.gray900,
        marginBottom: 2,
    },
    distanceText: {
        fontSize: 13,
        color: colors.gray500,
        marginBottom: 20,
    },
    // Category
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.gray900,
        marginBottom: 8,
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 16,
    },
    dropdownText: {
        fontSize: 14,
        color: colors.gray700,
    },
    dropdownArrow: {
        fontSize: 16,
        color: colors.gray400,
    },
    dropdownList: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: 10,
        marginBottom: 16,
        marginTop: -12,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    dropdownItemText: {
        fontSize: 14,
        color: colors.gray700,
    },
    // Tags
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 16,
        gap: 6,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
    },
    tagChipText: {
        color: colors.white,
        fontSize: 13,
        fontWeight: '500',
    },
    tagChipX: {
        color: colors.white,
        fontSize: 14,
    },
    tagInput: {
        flex: 1,
        minWidth: 120,
        fontSize: 14,
        color: colors.gray800,
        paddingVertical: 4,
    },
    // Description
    descriptionBox: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: 10,
        marginBottom: 20,
        padding: 12,
        minHeight: 100,
    },
    descriptionInput: {
        fontSize: 14,
        color: colors.gray800,
        minHeight: 80,
    },
    // Photo
    photoUpload: {
        height: 140,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: colors.gray200,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoUploadText: {
        fontSize: 14,
        color: colors.gray500,
    },
});
