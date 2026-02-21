import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function CommunityScreen() {
    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-4">Communauté</Text>
            <View className="flex-row mb-4">
                <TouchableOpacity className="bg-blue-100 px-4 py-2 rounded-full mr-2">
                    <Text className="text-blue-700 font-semibold">Discussion</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full">
                    <Text className="text-gray-700 font-semibold">Questions</Text>
                </TouchableOpacity>
            </View>

            <ScrollView>
                <View className="bg-white border border-gray-200 p-4 rounded-lg mb-4 shadow-sm">
                    <Text className="font-bold text-lg mb-2">Accessibilité Gare de Lyon ?</Text>
                    <Text className="text-gray-600 mb-2">Quelqu'un sait si l'ascenseur voie K est réparé ?</Text>
                    <View className="flex-row justify-between items-center mt-2">
                        <Text className="text-gray-400 text-xs">Par Alice • il y a 2h</Text>
                        <Text className="text-blue-500 text-xs">5 commentaires</Text>
                    </View>
                </View>

                <View className="bg-white border border-gray-200 p-4 rounded-lg mb-4 shadow-sm">
                    <Text className="font-bold text-lg mb-2">Rencontre Samedi</Text>
                    <Text className="text-gray-600 mb-2">On organise une sortie au parc floral cet après-midi.</Text>
                    <View className="flex-row justify-between items-center mt-2">
                        <Text className="text-gray-400 text-xs">Par Groupe Paris • il y a 5h</Text>
                        <Text className="text-blue-500 text-xs">12 participants</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
