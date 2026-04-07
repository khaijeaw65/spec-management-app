import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldAlert, AlertTriangle, Info, History, FileText } from 'lucide-react-native';

export default function DetailsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* App Bar */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100 bg-white z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 mr-2"
        >
          <ChevronLeft color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 flex-1" numberOfLines={1}>
          E-Commerce Platform Requirements
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Version + Status Row */}
        <View className="flex-row justify-between items-center pb-4 border-b border-gray-200 mb-4">
          <View>
            <Text className="text-xs text-gray-500 font-bold mb-1">VERSION</Text>
            <Text className="text-base font-bold text-gray-900">v2.4.0 (Draft)</Text>
          </View>
          <View className="bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5">
            <Text className="text-xs font-bold text-blue-600">Internal Review</Text>
          </View>
        </View>

        {/* Side-by-side action buttons */}
        <View className="flex-row gap-x-3 mb-6">
          <TouchableOpacity
            onPress={() => router.push('/version-history' as any)}
            className="flex-1 flex-row items-center justify-center gap-x-2 py-2.5 rounded-xl border border-gray-200 bg-gray-50"
          >
            <History color="#374151" size={15} />
            <Text className="text-[13px] font-semibold text-gray-700">Version History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/source-mom' as any)}
            className="flex-1 flex-row items-center justify-center gap-x-2 py-2.5 rounded-xl border border-gray-200 bg-gray-50"
          >
            <FileText color="#374151" size={15} />
            <Text className="text-[13px] font-semibold text-gray-700">Source MOM</Text>
          </TouchableOpacity>
        </View>

        {/* Spec Sections */}
        <View className="space-y-6">
          <View>
            <Text className="text-[19px] font-bold text-gray-900 mb-3">1. Overview</Text>
            <Text className="text-[15px] text-gray-600 leading-relaxed">
              The proposed E-Commerce platform aims to unify multi-region retail operations into a single headless architecture. The system must support up to 50,000 concurrent sessions and integrate seamlessly with existing ERP and inventory management systems. Key objectives include sub-second page loads and automated tax calculation for 45 jurisdictions.
            </Text>
          </View>

          <View>
            <Text className="text-[19px] font-bold text-gray-900 mb-3">2. User Requirements</Text>
            <Text className="text-[15px] text-gray-600 leading-relaxed">
              Authenticated users must be able to manage multiple shipping profiles and track order history in real-time. Guest checkout must be supported without sacrificing fraud detection capabilities. The UI must adhere to WCAG 2.1 Level AA accessibility standards across all customer-facing touchpoints, including the mobile-responsive web portal and native applications.
            </Text>
          </View>
        </View>

        {/* Ambiguity & Risks Section */}
        <View className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <View className="flex-row items-center mb-5 gap-x-2">
            <ShieldAlert color="#3B82F6" size={20} />
            <Text className="text-base font-bold text-gray-900">Ambiguity & Risks</Text>
          </View>

          {/* Risk 1: Missing Shipping Edge Cases */}
          <View className="bg-white rounded-xl mb-4 overflow-hidden border border-gray-100 shadow-sm flex-row">
            <View className="w-1 bg-yellow-400" />
            <View className="flex-1 p-4 flex-row gap-x-3">
              <AlertTriangle color="#D97706" size={18} className="mt-0.5" />
              <View className="flex-1">
                <Text className="text-[14px] font-bold text-gray-900 mb-1">Missing Shipping Edge Cases</Text>
                <Text className="text-[12px] text-gray-500 leading-tight">
                  The document lacks specific details on international customs processing for non-EU territories, which may delay API integration timelines.
                </Text>
              </View>
            </View>
          </View>

          {/* Risk 2: Concurrent Transaction Limit */}
          <View className="bg-white rounded-xl mb-5 overflow-hidden border border-gray-100 shadow-sm flex-row">
            <View className="w-1 bg-red-500" />
            <View className="flex-1 p-4 flex-row gap-x-3">
              <View className="bg-red-50 rounded-full p-1 self-start">
                <AlertTriangle color="#EF4444" size={16} />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-bold text-gray-900 mb-1">Concurrent Transaction Limit</Text>
                <Text className="text-[12px] text-gray-500 leading-tight">
                  Section 2.4 mentions high load but doesn't specify the exact behavior of the payment gateway when simultaneous transactions exceed 1,000 per second.
                </Text>
              </View>
            </View>
          </View>

          {/* AI Note */}
          <View className="flex-row gap-x-2 bg-[#F3F6F8] rounded-xl p-3 items-start">
            <Info color="#3B82F6" size={16} className="mt-0.5" />
            <Text className="text-[11px] text-gray-500 flex-1 leading-tight">
              These risks were automatically identified by the SpecReview AI engine based on historical project failures and industry standards.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View className={`absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 pt-4 ${Platform.OS === 'ios' ? 'pb-8' : 'pb-6'}`}>
        <TouchableOpacity className="w-full bg-blue-600 active:bg-blue-700 py-3.5 rounded-xl items-center shadow-sm">
          <Text className="text-white font-bold text-[15px]">Mark as Reviewed</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}