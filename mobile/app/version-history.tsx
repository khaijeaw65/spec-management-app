import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, GitCommit, CheckCircle2, Clock, User, Eye } from 'lucide-react-native';

const versions = [
  {
    version: 'v2.4.0',
    label: 'Draft',
    labelColor: '#3B82F6',
    labelBg: '#EFF6FF',
    date: 'Oct 24, 2023',
    author: 'Sarah Jenkins',
    isCurrent: true,
    changes: [
      'Added multi-region shipping support',
      'Updated WCAG 2.1 accessibility requirements',
      'Expanded concurrent session limit to 50,000',
    ],
  },
  {
    version: 'v2.3.0',
    label: 'Reviewed',
    labelColor: '#16A34A',
    labelBg: '#F0FDF4',
    date: 'Oct 10, 2023',
    author: 'Michael Chen',
    isCurrent: false,
    changes: [
      'Resolved payment gateway ambiguity in Section 2.4',
      'Added guest checkout fraud detection notes',
    ],
  },
  {
    version: 'v2.2.1',
    label: 'Reviewed',
    labelColor: '#16A34A',
    labelBg: '#F0FDF4',
    date: 'Sep 28, 2023',
    author: 'Robert Taylor',
    isCurrent: false,
    changes: [
      'Minor clarification on ERP integration endpoints',
      'Fixed terminology inconsistencies',
    ],
  },
  {
    version: 'v2.2.0',
    label: 'Reviewed',
    labelColor: '#16A34A',
    labelBg: '#F0FDF4',
    date: 'Sep 15, 2023',
    author: 'Sarah Jenkins',
    isCurrent: false,
    changes: [
      'Initial headless architecture proposal',
      'Defined 45 tax jurisdiction requirements',
    ],
  },
];

export default function VersionHistoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* App Bar */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ChevronLeft color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 flex-1">Version History</Text>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <Text className="text-sm text-gray-500 mb-6">
          E-Commerce Platform Requirements · {versions.length} versions
        </Text>

        {versions.map((v, index) => (
          <View key={index} className="flex-row mb-0">
            {/* Timeline Line */}
            <View className="items-center mr-4">
              <View className={`w-8 h-8 rounded-full items-center justify-center ${v.isCurrent ? 'bg-blue-600' : 'bg-gray-100'}`}>
                {v.isCurrent 
                  ? <Clock color="white" size={15} />
                  : <CheckCircle2 color="#9CA3AF" size={15} />
                }
              </View>
              {index < versions.length - 1 && (
                <View className="w-0.5 bg-gray-200 flex-1 my-1" style={{ minHeight: 28 }} />
              )}
            </View>

            {/* Card */}
            <View className={`flex-1 mb-5 rounded-2xl border p-4 ${v.isCurrent ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-white'} shadow-sm`}>
              <View className="flex-row justify-between items-center mb-2">
                <Text className={`text-[15px] font-bold ${v.isCurrent ? 'text-blue-700' : 'text-gray-900'}`}>
                  {v.version}
                  {v.isCurrent && <Text className="text-[12px] font-semibold text-blue-400"> · Current</Text>}
                </Text>
                <View className="rounded-full px-3 py-1 border" style={{ backgroundColor: v.labelBg, borderColor: v.labelColor + '40' }}>
                  <Text style={{ color: v.labelColor }} className="text-[11px] font-bold">{v.label}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-x-3 mb-3">
                <View className="flex-row items-center gap-x-1">
                  <User color="#9CA3AF" size={12} />
                  <Text className="text-xs text-gray-500">{v.author}</Text>
                </View>
                <View className="flex-row items-center gap-x-1">
                  <Clock color="#9CA3AF" size={12} />
                  <Text className="text-xs text-gray-500">{v.date}</Text>
                </View>
              </View>

              <View className="space-y-1 mb-4">
                {v.changes.map((change, ci) => (
                  <View key={ci} className="flex-row items-start gap-x-2">
                    <GitCommit color="#6B7280" size={12} style={{ marginTop: 2 }} />
                    <Text className="text-[12px] text-gray-600 flex-1 leading-tight">{change}</Text>
                  </View>
                ))}
              </View>

              {/* View button only — no Restore per FR-VERS-03 */}
              <TouchableOpacity
                className={`flex-row items-center justify-center gap-x-2 py-2 rounded-xl border ${
                  v.isCurrent
                    ? 'border-blue-300 bg-blue-100'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Eye color={v.isCurrent ? '#3B82F6' : '#6B7280'} size={14} />
                <Text className={`text-[13px] font-semibold ${
                  v.isCurrent ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {v.isCurrent ? 'Viewing Current' : 'View'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
