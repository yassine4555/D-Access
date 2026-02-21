import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { colors } from '../../constants/colors';
import { CheckIcon } from '../icons/CheckIcon';

interface CheckboxProps {
    checked: boolean;
    onPress: () => void;
    label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onPress, label }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}
        >
            <View
                style={{
                    width: 20,
                    height: 20,
                    borderWidth: 2,
                    borderColor: checked ? colors.primary : colors.border,
                    backgroundColor: checked ? colors.primary : colors.white,
                    borderRadius: 4,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                }}
            >
                {checked && <CheckIcon width={10} height={8} color={colors.white} />}
            </View>
            {label && <Text style={{ color: colors.gray700 }}>{label}</Text>}
        </TouchableOpacity>
    );
};
