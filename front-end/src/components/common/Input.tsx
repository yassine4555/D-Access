import React from 'react';
import { TextInput, View, Text, TextInputProps, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../../constants/colors';

interface InputProps extends TextInputProps {
    label?: string;
    containerStyle?: StyleProp<ViewStyle>;
}

export const Input: React.FC<InputProps> = ({ label, containerStyle, style, ...props }) => {
    return (
        <View style={[{ marginBottom: 16 }, containerStyle]}>
            {label && <Text style={{ color: colors.gray900, marginBottom: 6 }}>{label}</Text>}
            <TextInput
                style={[
                    {
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 8,
                        padding: 12,
                        backgroundColor: props.editable === false ? colors.gray100 : colors.white,
                    },
                    style,
                ]}
                placeholderTextColor={colors.gray400}
                {...props}
            />
        </View>
    );
};
