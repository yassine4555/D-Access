import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { colors } from '../../constants/colors';

interface ButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    variant?: 'primary' | 'outline' | 'ghost'; // For potential future variants
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    style,
    textStyle
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                {
                    backgroundColor: colors.primary,
                    paddingVertical: 14,
                    borderRadius: 8,
                    alignItems: 'center',
                    opacity: disabled ? 0.6 : 1,
                },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={colors.white} />
            ) : (
                <Text style={[{ color: colors.white, fontWeight: '600', fontSize: 16 }, textStyle]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};
