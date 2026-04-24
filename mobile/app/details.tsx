import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Platform, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft, ShieldAlert, AlertTriangle, Info,
  History, FileText,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useAppTheme';
import { getSpecDetail, markAsReviewed } from '@/services/api';
import type { SpecDetail, SpecRisk } from '@/types/api';
import { Alert } from 'react-native';

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

function riskColor(priority: string, colors: any) {
  switch (priority) {
    case 'HIGH': return colors.danger;
    case 'MEDIUM': return '#f97316'; // Orange
    case 'LOW': return colors.warning; // Yellow
    default: return colors.warning;
  }
}

function riskBg(priority: string, c: any) {
  switch (priority) {
    case 'HIGH': return c.dangerBg;
    case 'MEDIUM': return '#f9731620'; // Orange transparent
    case 'LOW': return c.pendingBg; // Yellow transparent
    default: return c.pendingBg;
  }
}

export default function DetailsScreen() {
  const router = useRouter();
  const { mainId, versionId, name } = useLocalSearchParams<{
    mainId: string;
    versionId: string;
    name: string;
  }>();
  const { c, colors } = useTheme();

  const [detail, setDetail] = useState<SpecDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!mainId || !versionId) {
      setError('Missing mainId or versionId');
      return;
    }
    try {
      setError(null);
      const data = await getSpecDetail(mainId, versionId);
      setDetail(data);
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
      await fetchDetail();
      setLoading(false);
    })();
  }, [fetchDetail]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDetail();
    setRefreshing(false);
  }, [fetchDetail]);

  const handleMarkAsReviewed = async () => {
    if (!mainId) return;
    try {
      setIsReviewing(true);
      await markAsReviewed(mainId as string);

      if (detail) {
        setDetail({ ...detail, status: 'REVIEWED' });
      }
    } catch (err: any) {
      console.log('Error marking as reviewed:', err);
      Alert.alert('Error', 'Failed to mark as reviewed. Please try again.');
    } finally {
      setIsReviewing(false);
    }
  };

  const specName = detail?.name || (name as string) || 'Specification';
  const specVersion = detail?.version || '';
  const specStatus = detail?.status || '';
  const sections = Array.isArray(detail?.sections) ? detail!.sections : [];
  const risks = Array.isArray(detail?.risks) ? detail!.risks : [];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: c.background }}>
      <View className="flex-row items-center px-4 py-4 border-b z-10" style={{ borderColor: c.border, backgroundColor: c.background }}>
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ChevronLeft color={c.textPrimary} size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1" numberOfLines={1} style={{ color: c.textPrimary }}>
          {specName}
        </Text>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm mt-3" style={{ color: c.textSecondary }}>Loading specification…</Text>
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
        <>
          <ScrollView
            className="flex-1 px-6 pt-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            <View className="flex-row justify-between items-center pb-4 border-b mb-4" style={{ borderColor: c.border }}>
              <View>
                <Text className="text-xs font-bold mb-1" style={{ color: c.textSecondary }}>VERSION</Text>
                <Text className="text-base font-bold" style={{ color: c.textPrimary }}>
                  {specVersion || '—'}
                </Text>
              </View>
              {specStatus ? (
                <View
                  className="rounded-full px-4 py-1.5 border"
                  style={{
                    backgroundColor: statusBg(specStatus, c),
                    borderColor: statusColor(specStatus, colors) + '40',
                  }}
                >
                  <Text className="text-xs font-bold" style={{ color: statusColor(specStatus, colors) }}>
                    {specStatus}
                  </Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/version-history' as any,
                params: { mainId: mainId, versionId: versionId, name: specName },
              })}
              className="flex-row items-center justify-center gap-x-2 py-3 rounded-xl border mb-6"
              style={{ backgroundColor: c.card, borderColor: c.border }}
            >
              <History color={c.textPrimary} size={16} />
              <Text className="text-[13px] font-semibold" style={{ color: c.textPrimary }}>
                Version History
              </Text>
            </TouchableOpacity>

            {sections.length > 0 ? (
              <View className="space-y-6">
                {sections.map((section, index) => (
                  <View key={index}>
                    <Text className="text-[19px] font-bold mb-3" style={{ color: c.textPrimary }}>
                      {section.title}
                    </Text>
                    <Text className="text-[15px] leading-relaxed" style={{ color: c.textSecondary }}>
                      {section.content}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="py-12 items-center">
                <FileText color={c.border} size={40} />
                <Text className="text-sm mt-2" style={{ color: c.textSecondary }}>No sections available</Text>
              </View>
            )}
            {risks.length > 0 && (
              <View className="mt-8 border rounded-2xl p-5" style={{ backgroundColor: c.sectionBg, borderColor: c.border }}>
                <View className="flex-row items-center mb-5 gap-x-2">
                  <ShieldAlert color={colors.processing} size={20} />
                  <Text className="text-base font-bold" style={{ color: c.textPrimary }}>Ambiguity & Risks</Text>
                </View>

                {risks.map((risk: SpecRisk, index: number) => {
                  const rColor = riskColor(risk.priority, colors);
                  const rBg = riskBg(risk.priority, c);
                  return (
                    <View
                      key={index}
                      className="rounded-xl mb-4 border shadow-sm p-4"
                      style={{ backgroundColor: c.card, borderColor: c.border }}
                    >
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-row items-center flex-1 pr-3">
                          <View className="rounded-full p-1.5 mr-2" style={{ backgroundColor: rBg }}>
                            <AlertTriangle color={rColor} size={16} />
                          </View>
                          <Text className="text-[15px] font-bold" style={{ color: c.textPrimary }}>
                            {risk.riskType ? risk.riskType.replace(/_/g, ' ') : "Unknown Risk"}
                          </Text>
                        </View>
                        <View className="rounded-full px-2 py-1 border" style={{ backgroundColor: rBg, borderColor: rColor + '40' }}>
                          <Text className="text-[10px] font-bold" style={{ color: rColor }}>
                            {risk.priority}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-[13px] leading-relaxed mb-3" style={{ color: c.textPrimary }}>
                        {risk.detail}
                      </Text>
                      {risk.referenceText ? (
                        <View className="pl-3 border-l-2 py-1" style={{ borderColor: rColor, backgroundColor: rBg, borderTopRightRadius: 6, borderBottomRightRadius: 6, paddingRight: 8 }}>
                          <Text className="text-[12px] italic leading-tight" style={{ color: c.textSecondary }}>
                            "{risk.referenceText}"
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
                <View className="flex-row gap-x-2 rounded-xl p-3 items-start" style={{ backgroundColor: c.subtleBg }}>
                  <Info color={colors.processing} size={16} style={{ marginTop: 2 }} />
                  <Text className="text-[11px] flex-1 leading-tight" style={{ color: c.textSecondary }}>
                    These risks were automatically identified by the SpecReview AI engine based on historical project failures and industry standards.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
          <View className={`absolute bottom-0 w-full border-t px-6 pt-4 ${Platform.OS === 'ios' ? 'pb-8' : 'pb-6'}`} style={{ backgroundColor: c.background, borderColor: c.border }}>
            <TouchableOpacity
              className="w-full py-3.5 rounded-xl items-center shadow-sm flex-row justify-center gap-x-2"
              style={{ backgroundColor: isReviewing ? colors.primary + '80' : colors.primary }}
              onPress={handleMarkAsReviewed}
              disabled={isReviewing}
            >
              {isReviewing ? <ActivityIndicator color={colors.white} size="small" /> : null}
              <Text className="font-bold text-[15px]" style={{ color: colors.white }}>
                {isReviewing ? 'Marking as Reviewed...' : 'Mark as Reviewed'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}