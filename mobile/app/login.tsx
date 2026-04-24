import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useAppTheme';
import { login } from '@/services/api';

export default function LoginScreen() {
  const { c, colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function validate(): boolean {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('กรุณากรอก Email');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('รูปแบบ Email ไม่ถูกต้อง');
      valid = false;
    }

    if (!password) {
      setPasswordError('กรุณากรอก Password');
      valid = false;
    }

    return valid;
  }

  async function handleLogin() {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';

      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', message, [
        { text: 'ตกลง', style: 'default' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: c.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center items-center">

          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              backgroundColor: '#2563eb',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <ShieldCheck color={colors.white} size={30} />
          </View>

          <Text className="text-2xl font-bold" style={{ color: c.textPrimary, marginBottom: 6 }}>
            SpecBuilder
          </Text>
          <Text className="text-sm text-center" style={{ color: c.textSecondary, marginBottom: 32 }}>
            Please enter your credentials to access the application
          </Text>

          <View className="w-full">

            <View className="mb-4">
              <Text className="text-xs font-semibold mb-1.5 ml-1" style={{ color: c.textPrimary }}>
                Email
              </Text>
              <View
                className="flex-row items-center border rounded-xl px-3 h-12"
                style={{
                  backgroundColor: c.card,
                  borderColor: emailError ? colors.danger : c.border,
                }}
              >
                <Mail color={emailError ? colors.danger : c.textSecondary} size={16} />
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor={c.textSecondary}
                  className="flex-1 ml-2.5 text-sm"
                  style={{ color: c.textPrimary }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>
              {emailError ? (
                <Text className="text-xs mt-1 ml-1" style={{ color: colors.danger }}>
                  {emailError}
                </Text>
              ) : null}
            </View>

            <View className="mb-7">
              <Text className="text-xs font-semibold mb-1.5 ml-1" style={{ color: c.textPrimary }}>
                Password
              </Text>
              <View
                className="flex-row items-center border rounded-xl px-3 h-12"
                style={{
                  backgroundColor: c.card,
                  borderColor: passwordError ? colors.danger : c.border,
                }}
              >
                <Lock color={passwordError ? colors.danger : c.textSecondary} size={16} />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={c.textSecondary}
                  className="flex-1 ml-2.5 text-sm"
                  style={{ color: c.textPrimary }}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setPasswordError(''); }}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showPassword
                    ? <EyeOff color={c.textSecondary} size={16} />
                    : <Eye color={c.textSecondary} size={16} />
                  }
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text className="text-xs mt-1 ml-1" style={{ color: colors.danger }}>
                  {passwordError}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-full items-center justify-center"
              style={{
                backgroundColor: loading ? colors.primary + '80' : colors.primary,
              }}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text className="font-bold text-[15px]" style={{ color: colors.white }}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </View>

        <View className="pb-8 pt-4 items-center">
          <Text className="text-[11px]" style={{ color: c.textSecondary }}>
            Spec Management App
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
