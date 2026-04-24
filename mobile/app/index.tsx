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

function timeAgo(dateInput: string): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
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
          <Text className="text-2xl font-bold mb-1" style={{ color: c.textPrimary }}>Welcome back</Text>
          <Text className="text-sm" style={{ color: c.textSecondary }}>
            {specs.length > 0
              ? `You have ${stats.processing} documents in processing.`
              : 'Loading your specifications…'}
          </Text>
        </View>

        <View className="flex-row justify-between mb-8 gap-x-3">
          {[
            { icon: FileText, value: String(stats.total), label: 'TOTAL', iconColor: colors.processing },
            { icon: Loader, value: String(stats.processing), label: 'PROCESSING', iconColor: colors.warning },
            { icon: CheckCircle2, value: String(stats.complete), label: 'COMPLETE', iconColor: colors.success },
          ].map((stat, i) => (
            <View key={i} className="flex-1 border rounded-2xl py-4 items-center shadow-sm" style={{ backgroundColor: c.card, borderColor: c.border }}>
              <stat.icon color={stat.iconColor} size={20} className="mb-2" />
              <Text className="text-xl font-bold" style={{ color: c.textPrimary }}>{stat.value}</Text>
              <Text className="text-[10px] font-bold mt-1" style={{ color: c.textSecondary }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View className="mb-8">
          <Text className="text-lg font-bold" style={{ color: c.textPrimary }}>Recent activity</Text>
          <Text className="text-xs mb-4" style={{ color: c.textSecondary }}>Latest updates across your specifications.</Text>

          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} className="py-4" />
          ) : error ? (
            <Text className="text-xs text-center py-4" style={{ color: colors.danger }}>{error}</Text>
          ) : specs.length === 0 ? (
            <Text className="text-xs text-center py-4" style={{ color: c.textSecondary }}>No recent activity.</Text>
          ) : (
            <View className="mt-2">
              {[...specs]
                .sort((a, b) => {
                  const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
                  const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
                  return dateB - dateA;
                })
                .slice(0, 5)
                .map((spec) => (
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
                    className="flex-row items-center p-5 mb-3 rounded-2xl"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                  >
                    <View className="w-10 h-10 rounded-[10px] items-center justify-center mr-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}>
                      <FileText color={isDark ? '#e4e4e7' : c.textSecondary} size={18} />
                    </View>
                    <View className="flex-1 pr-2 justify-center">
                      <Text className="text-[14px] font-bold" numberOfLines={1} style={{ color: isDark ? '#ffffff' : c.textPrimary }}>
                        {spec.name || spec.title || 'Untitled Document'}
                      </Text>
                      <Text className="text-[10px] mt-1" style={{ color: c.textSecondary }}>
                        {spec.title || 'Template'} {spec.version ? `· v${spec.version}` : ''}
                      </Text>
                    </View>
                    <View className="items-end justify-center mr-2">
                      <Text className="text-[10px] mb-1.5" style={{ color: c.textSecondary }}>
                        {timeAgo(spec.updatedAt || spec.createdAt)}
                      </Text>
                      <View
                        className="px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: statusBg(spec.status, c) }}
                      >
                        <Text className="text-[9px] font-bold" style={{ color: statusColor(spec.status, colors) }}>
                          {(spec.status || '').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight color={c.textSecondary} size={16} />
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>

      </ScrollView>

      <View
        className={`flex-row justify-around items-center border-t px-6 pt-3 absolute bottom-0 w-full ${Platform.OS === 'ios' ? 'pb-8' : 'pb-4'}`}
        style={{ backgroundColor: c.background, borderColor: c.border }}
      >
        <TouchableOpacity className="items-center flex-1">
          <Home color={colors.primary} size={24} />
          <Text className="text-[10px] font-medium mt-1" style={{ color: colors.primary }}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center flex-1" onPress={() => router.replace('/specifications')}>
          <File color={c.textSecondary} size={24} />
          <Text className="text-[10px] font-medium mt-1" style={{ color: c.textSecondary }}>Doc</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}