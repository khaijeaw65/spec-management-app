import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Platform, RefreshControl, ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Shield, FileText, CheckCircle2,
  Clock, ChevronRight, Home, File,
  Search, X, Loader, AlertTriangle, LogOut,
} from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '@/hooks/useAppTheme';
import { getSpecifications, logout } from '@/services/api';
import type { Specification, SpecStatus, SpecLanguage } from '@/types/api';

const STATUS_CHIPS: Array<'All' | SpecStatus> = ['All', 'PROCESSING', 'COMPLETED', 'REVIEWED', 'FAILED'];
const LANG_CHIPS: Array<'All' | SpecLanguage> = ['All', 'TH', 'EN'];

function getChipActiveColor(chip: string, isDark: boolean, colors: any) {
  switch (chip) {
    case 'All':
      return { bg: isDark ? colors.light.background : colors.dark.card, text: isDark ? colors.dark.background : colors.white };
    case 'PROCESSING':
      return { bg: colors.processing, text: colors.white };
    case 'COMPLETED':
      return { bg: colors.success, text: colors.white };
    case 'REVIEWED':
      return { bg: colors.primary, text: colors.white };
    case 'FAILED':
      return { bg: colors.danger, text: colors.white };
    case 'TH':
    case 'EN':
      return { bg: colors.primary, text: colors.white };
    default:
      return { bg: colors.dark.card, text: colors.white };
  }
}

function statusColor(status: string, colors: any) {
  switch (status) {
    case 'PROCESSING': return colors.processing;
    case 'COMPLETED': return colors.success;
    case 'REVIEWED': return colors.primary;
    case 'FAILED': return colors.danger;
    default: return colors.warning;
  }
}

function statusBg(status: string, c: any) {
  switch (status) {
    case 'PROCESSING': return c.processingBg;
    case 'COMPLETED': return c.reviewedBg;
    case 'REVIEWED': return c.processingBg;
    case 'FAILED': return c.dangerBg;
    default: return c.pendingBg;
  }
}
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SpecificationsScreen() {
  const { isDark, c, colors } = useTheme();

  const [specs, setSpecs] = useState<Specification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<'All' | SpecStatus>('All');
  const [activeLang, setActiveLang] = useState<'All' | SpecLanguage>('All');

  useEffect(() => {
    SecureStore.getItemAsync('userName').then((name) => {
      if (name) setUserName(name);
    });
  }, []);

  const userInitials = useMemo(() => {
    if (!userName.trim()) return '?';
    const parts = userName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [userName]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  }, []);

  const fetchSpecs = useCallback(async () => {
    try {
      setError(null);
      const data = await getSpecifications();
      setSpecs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง';
      setError(message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchSpecs();
      setLoading(false);
    })();
  }, [fetchSpecs]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSpecs();
    setRefreshing(false);
  }, [fetchSpecs]);

  const filteredSpecs = useMemo(() => {
    if (!Array.isArray(specs)) return [];
    return specs.filter((spec) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const name = (spec?.name || spec?.title || '').toLowerCase();
        if (!name.includes(q)) return false;
      }
      if (activeStatus !== 'All' && spec?.status !== activeStatus) return false;
      if (activeLang !== 'All' && spec?.language !== activeLang) return false;

      return true;
    });
  }, [specs, searchQuery, activeStatus, activeLang]);

  const stats = useMemo(() => {
    const safeSpecs = Array.isArray(specs) ? specs : [];
    const total = safeSpecs.length;
    const processing = safeSpecs.filter(s => s.status === 'PROCESSING').length;
    const complete = safeSpecs.filter(s => s.status === 'COMPLETED').length;
    const reviewed = safeSpecs.filter(s => s.status === 'REVIEWED').length;
    return { total, processing, complete, reviewed };
  }, [specs]);

  const renderChip = (
    label: string,
    isActive: boolean,
    onPress: () => void,
  ) => {
    const activeStyle = getChipActiveColor(label, isDark, colors);
    return (
      <TouchableOpacity
        key={label}
        onPress={onPress}
        className="mr-2 px-4 py-1.5 rounded-full border"
        style={{
          backgroundColor: isActive ? activeStyle.bg : c.card,
          borderColor: isActive ? activeStyle.bg : c.border,
        }}
      >
        <Text
          className="text-[13px] font-semibold"
          style={{ color: isActive ? activeStyle.text : c.textSecondary }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 pt-8" style={{ backgroundColor: c.background }}>

      <View className="flex-row justify-between items-center px-6 py-4 border-b" style={{ borderColor: c.border }}>
        <View
          className="w-10 h-10 rounded-xl justify-center items-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Shield color={colors.white} size={20} />
        </View>

        <Text className="text-[17px] font-bold" style={{ color: c.textPrimary }}>Specifications</Text>

        <TouchableOpacity
          onPress={handleLogout}
          className="w-10 h-10 rounded-full justify-center items-center"
          style={{ backgroundColor: '#3f3f46' }}
        >
          <Text className="text-sm font-bold" style={{ color: colors.white }}>
            {userInitials}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >

        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">Welcome back, Alex</Text>
          <Text className="text-sm text-gray-500">You have 3 documents awaiting review.</Text>
        </View>


        <View className="flex-row justify-between mb-8 gap-x-3">
          <View className="flex-1 bg-white border border-gray-200 rounded-2xl py-4 items-center shadow-sm">
            <FileText color="#3B82F6" size={20} className="mb-2" />
            <Text className="text-xl font-bold text-gray-900">24</Text>
            <Text className="text-[10px] font-bold text-gray-500 mt-1">TOTAL</Text>
          </View>

          <View className="flex-1 bg-white border border-gray-200 rounded-2xl py-4 items-center shadow-sm">
            <AlertCircle color="#4B5563" size={20} className="mb-2" />
            <Text className="text-xl font-bold text-gray-900">8</Text>
            <Text className="text-[10px] font-bold text-gray-500 mt-1">PROCESSING</Text>
          </View>

          <View className="flex-1 bg-white border border-gray-200 rounded-2xl py-4 items-center shadow-sm">
            <CheckCircle2 color="#4B5563" size={20} className="mb-2" />
            <Text className="text-xl font-bold text-gray-900">16</Text>
            <Text className="text-[10px] font-bold text-gray-500 mt-1">REVIEWED</Text>
          </View>
        </View>

        <View className="mb-3">
          <Text className="text-xs font-bold mb-2 ml-1" style={{ color: c.textSecondary }}>STATUS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
            {STATUS_CHIPS.map((chip) =>
              renderChip(chip, activeStatus === chip, () => setActiveStatus(chip))
            )}
          </ScrollView>
        </View>

        <View className="mb-5">
          <Text className="text-xs font-bold mb-2 ml-1" style={{ color: c.textSecondary }}>LANGUAGE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
            {LANG_CHIPS.map((chip) =>
              renderChip(chip, activeLang === chip, () => setActiveLang(chip))
            )}
          </ScrollView>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold" style={{ color: c.textPrimary }}>
            Documents
          </Text>
          <Text className="text-xs font-semibold" style={{ color: c.textSecondary }}>
            {filteredSpecs.length} result{filteredSpecs.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {loading && (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-sm mt-3" style={{ color: c.textSecondary }}>Loading specifications…</Text>
          </View>
        )}

        {!loading && error && (
          <View className="py-12 items-center justify-center border rounded-2xl" style={{ backgroundColor: c.dangerBg, borderColor: colors.danger + '30' }}>
            <AlertTriangle color={colors.danger} size={32} />
            <Text className="text-sm font-semibold mt-3 mb-1" style={{ color: colors.danger }}>Error Loading Data</Text>
            <Text className="text-xs text-center px-8 mb-4" style={{ color: c.textSecondary }}>{error}</Text>
            <TouchableOpacity
              onPress={onRefresh}
              className="px-6 py-2 rounded-xl"
              style={{ backgroundColor: colors.danger }}
            >
              <Text className="text-xs font-bold" style={{ color: colors.white }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && filteredSpecs.length === 0 && (
          <View className="py-16 items-center justify-center">
            <FileText color={c.border} size={48} />
            <Text className="text-sm font-semibold mt-3" style={{ color: c.textSecondary }}>
              {specs.length === 0 ? 'No specifications found' : 'No matching results'}
            </Text>
            <Text className="text-xs mt-1" style={{ color: c.textSecondary }}>
              {specs.length === 0
                ? 'Pull down to refresh'
                : 'Try adjusting your filters'}
            </Text>
          </View>
        )}

        {!loading && !error && filteredSpecs.length > 0 && (
          <View className="space-y-3">
            {filteredSpecs.map((spec) => (
              <TouchableOpacity
                key={spec.id}
                onPress={() => router.push({
                  pathname: '/details',
                  params: {
                    mainId: spec.id,
                    versionId: (spec as any).versionId,
                    name: spec.name || spec.title,
                  },
                })}
                className="border rounded-2xl p-4 flex-row items-center shadow-sm mb-3"
                style={{ backgroundColor: c.card, borderColor: c.border }}
              >
                <View className="flex-1 pr-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-[15px] font-bold flex-1 mr-2" numberOfLines={1} style={{ color: c.textPrimary }}>
                      {spec.name || spec.title}
                    </Text>
                    <View
                      className="border rounded-full px-2 py-1"
                      style={{
                        backgroundColor: statusBg(spec.status, c),
                        borderColor: statusColor(spec.status, colors) + '40',
                      }}
                    >
                      <Text className="text-[10px] font-medium" style={{ color: statusColor(spec.status, colors) }}>
                        {spec.status}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    {spec.version ? (
                      <View className="rounded-full px-2 py-0.5 mr-3" style={{ backgroundColor: c.sectionBg }}>
                        <Text className="text-[10px] font-bold" style={{ color: c.textPrimary }}>
                          {spec.version}
                        </Text>
                      </View>
                    ) : null}
                    <View className="flex-row items-center mr-4">
                      <Clock color={c.textSecondary} size={12} />
                      <Text className="text-xs ml-1" style={{ color: c.textSecondary }}>
                        {formatDate(spec.updatedAt || spec.createdAt)}
                      </Text>
                    </View>
                    <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: c.sectionBg }}>
                      <Text className="text-[10px] font-bold" style={{ color: c.textSecondary }}>
                        {spec.language}
                      </Text>
                    </View>
                  </View>
                </View>
                <ChevronRight color={c.border} size={20} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View
        className={`flex-row justify-around items-center border-t px-6 pt-3 absolute bottom-0 w-full ${Platform.OS === 'ios' ? 'pb-8' : 'pb-4'}`}
        style={{ backgroundColor: c.background, borderColor: c.border }}
      >
        <TouchableOpacity className="items-center flex-1" onPress={() => router.replace('/')}>
          <Home color={c.textSecondary} size={24} />
          <Text className="text-[10px] font-medium mt-1" style={{ color: c.textSecondary }}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center flex-1">
          <File color={colors.primary} size={24} />
          <Text className="text-[10px] font-medium mt-1" style={{ color: colors.primary }}>Doc</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}