import React from 'react';
import { View, Text, TextInput, TouchableOpacity,  KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ShieldCheck } from 'lucide-react-native';
import { router, useRouter } from 'expo-router';

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        
        <View className="flex-1 px-6 justify-center items-center">
          
          
          <View className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
            <ShieldCheck color="white" size={32} />
          </View>
          
          <Text className="text-2xl font-bold mb-10 text-gray-900">Login</Text>

         
          <View className="w-full space-y-4">
            <View className="mb-4">
              <Text className="text-xs text-gray-500 mb-1 ml-1">Email</Text>
              <View className="relative flex-row items-center border border-gray-200 rounded-lg bg-white px-3 h-11">
                <Mail color="#9CA3AF" size={16} />
                <TextInput 
                  placeholder="name@gmail.com" 
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-sm text-gray-900"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-xs text-gray-500 mb-1 ml-1">Password</Text>
              <View className="relative flex-row items-center border border-gray-200 rounded-lg bg-white px-3 h-11">
                <Lock color="#9CA3AF" size={16} />
                <TextInput 
                  placeholder="••••••••" 
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-sm text-gray-900"
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => router.replace('/specifications')}  
              className="w-full bg-blue-600 active:bg-blue-700 py-3 rounded-lg items-center mt-2"
            >
            <Text className="text-white font-medium text-sm">Login</Text>
            </TouchableOpacity>
          </View>
        </View>

     
        <View className="pb-8 pt-4 items-center">
          <Text className="text-[10px] text-gray-400">Spec-Management-App</Text>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}