import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft, CheckCircle2, Clock, Eye, Globe, AlertTriangle,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useAppTheme';
import { getSpecDetail } from '@/services/api';
import type { SpecVersion } from '@/types/api';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusBadgeStyle(status: string, c: any, colors: any) {
  switch (status) {
    case 'PROCESSING':
      return { bg: c.processingBg, text: colors.processing, border: colors.processing + '40' };
    case 'COMPLETED':
      return { bg: c.reviewedBg, text: colors.success, border: colors.success + '40' };
    case 'REVIEWED':
      return { bg: c.processingBg, text: colors.primary, border: colors.primary + '40' };
    case 'FAILED':
      return { bg: c.dangerBg, text: colors.danger, border: colors.danger + '40' };
    default:
      return { bg: c.pendingBg, text: colors.warning, border: colors.warning + '40' };
  }
}

export default function VersionHistoryScreen() {
  const router = useRouter();
  const { mainId, versionId, name } = useLocalSearchParams<{
    mainId: string;
    versionId: string;
    name: string;
  }>();
  const { c, colors } = useTheme();

  const [versions, setVersions] = useState<SpecVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const specName = (name as string) || 'Specification';

  const fetchVersions = useCallback(async () => {
    if (!mainId || !versionId) {
      setError('Missing specification ID or Version ID');
      return;
    }
    try {
      setError(null);
      const data = await getSpecDetail(mainId, versionId);

      if (data) {
        const mockVersion: SpecVersion = {
          id: data.id,
          version: data.version,
          status: data.status,
          language: data.language,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        setVersions([mockVersion]);
      } else {
        setVersions([]);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง';
      setError(message);
    }
  }, [mainId, versionId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchVersions();
      setLoading(false);
    })();
  }, [fetchVersions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVersions();
    setRefreshing(false);
  }, [fetchVersions]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: c.background }}>

      <View className="flex-row items-center px-4 py-4 border-b" style={{ borderColor: c.border, backgroundColor: c.background }}>
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ChevronLeft color={c.textPrimary} size={24} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold" numberOfLines={1} style={{ color: c.textPrimary }}>
            Version History
          </Text>
          <Text className="text-xs" numberOfLines={1} style={{ color: c.textSecondary }}>
            {specName}
          </Text>
        </View>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm mt-3" style={{ color: c.textSecondary }}>Loading versions…</Text>
        </View>
      )}

      {!loading && error && (
        <View className="flex-1 items-center justify-center px-8">
          <AlertTriangle color={colors.danger} size={40} />
          <Text className="text-sm font-semibold mt-3 mb-1" style={{ color: colors.danger }}>Error Loading Data</Text>
          <Text className="text-xs text-center mb-4" style={{ color: c.textSecondary }}>{error}</Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="px-6 py-2 rounded-xl"
            style={{ backgroundColor: colors.danger }}
          >
            <Text className="text-xs font-bold" style={{ color: colors.white }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <ScrollView
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >

          <Text className="text-sm mb-6" style={{ color: c.textSecondary }}>
            {specName} · {versions.length} version{versions.length !== 1 ? 's' : ''}
          </Text>

          {versions.length === 0 && (
            <View className="py-16 items-center">
              <Clock color={c.border} size={40} />
              <Text className="text-sm mt-3" style={{ color: c.textSecondary }}>No versions found</Text>
            </View>
          )}

          {versions.map((v, index) => {
            const isCurrent = index === 0;
            const badge = statusBadgeStyle(v.status, c, colors);

            return (
              <View key={v.id || index} className="flex-row mb-0">

                <View className="items-center mr-4">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: isCurrent ? colors.processing : c.sectionBg }}
                  >
                    {isCurrent
                      ? <Clock color={colors.white} size={15} />
                      : <CheckCircle2 color={c.textSecondary} size={15} />
                    }
                  </View>
                  {index < versions.length - 1 && (
                    <View className="w-0.5 flex-1 my-1" style={{ backgroundColor: c.border, minHeight: 28 }} />
                  )}
                </View>

                <View
                  className="flex-1 mb-5 rounded-2xl border p-4 shadow-sm"
                  style={{
                    backgroundColor: isCurrent ? c.processingBg : c.card,
                    borderColor: isCurrent ? colors.processing + '40' : c.border,
                  }}
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-[15px] font-bold" style={{ color: isCurrent ? colors.processing : c.textPrimary }}>
                      {v.version ? `Version ${v.version}` : `Version ${index + 1}`}
                      {isCurrent && (
                        <Text className="text-[12px] font-semibold" style={{ color: colors.processing }}>
                          {' '}· Current
                        </Text>
                      )}
                    </Text>
                    <View className="rounded-full px-3 py-1 border" style={{ backgroundColor: badge.bg, borderColor: badge.border }}>
                      <Text className="text-[11px] font-bold" style={{ color: badge.text }}>
                        {v.status}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-x-3 mb-3">
                    <View className="flex-row items-center gap-x-1">
                      <Clock color={c.textSecondary} size={12} />
                      <Text className="text-xs" style={{ color: c.textSecondary }}>
                        {formatDate(v.createdAt || v.updatedAt)}
                      </Text>
                    </View>
                    {v.language && (
                      <View className="flex-row items-center gap-x-1">
                        <Globe color={c.textSecondary} size={12} />
                        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: c.sectionBg }}>
                          <Text className="text-[10px] font-bold" style={{ color: c.textSecondary }}>
                            {v.language}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center justify-center gap-x-2 py-2 rounded-xl border"
                    style={{
                      backgroundColor: isCurrent ? colors.processing + '20' : c.sectionBg,
                      borderColor: isCurrent ? colors.processing + '60' : c.border,
                    }}
                  >
                    <Eye color={isCurrent ? colors.processing : c.textSecondary} size={14} />
                    <Text className="text-[13px] font-semibold" style={{ color: isCurrent ? colors.processing : c.textSecondary }}>
                      {isCurrent ? 'Viewing Current' : 'View'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
