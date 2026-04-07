import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Users, CalendarDays, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react-native';

const momData = {
  title: 'E-Commerce Platform Requirements',
  meetingDate: 'October 20, 2023',
  meetingTime: '10:00 AM – 11:30 AM (GMT+7)',
  location: 'Google Meet · Virtual',
  facilitator: 'Sarah Jenkins',
  attendees: [
    { name: 'Sarah Jenkins', role: 'Product Lead', initials: 'SJ', color: '#3B82F6' },
    { name: 'Michael Chen', role: 'Tech Lead', initials: 'MC', color: '#8B5CF6' },
    { name: 'Robert Taylor', role: 'QA Engineer', initials: 'RT', color: '#10B981' },
    { name: 'Emily Watson', role: 'UX Designer', initials: 'EW', color: '#F59E0B' },
  ],
  agendaItems: [
    {
      topic: 'Shipping & Customs Requirements',
      discussion: 'The team discussed the missing edge cases for non-EU international shipping. It was noted that customs processing APIs need further documentation before the integration sprint begins.',
      decisions: ['Assign Robert to draft customs processing requirements by Oct 27.'],
      status: 'action',
    },
    {
      topic: 'Concurrent Transaction Load Testing',
      discussion: 'Section 2.4 of the spec was flagged as ambiguous. The payment gateway partner confirmed 1,000 TPS as a soft limit, but behavior beyond that is undocumented.',
      decisions: [
        'Request official documentation from payment gateway vendor.',
        'Add a fallback queue mechanism to the architecture diagram.',
      ],
      status: 'action',
    },
    {
      topic: 'WCAG 2.1 Compliance Scope',
      discussion: 'Agreed that WCAG 2.1 Level AA applies to all web touchpoints but Level A is sufficient for native apps in the first release.',
      decisions: ['Update specification Section 2.3 to reflect native app scope.'],
      status: 'resolved',
    },
  ],
};

export default function SourceMomScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* App Bar */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ChevronLeft color="#374151" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 flex-1">Source MOM</Text>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Meeting Header */}
        <View className="bg-gray-50 rounded-2xl p-5 border border-gray-200 mb-6">
          <Text className="text-[17px] font-bold text-gray-900 mb-3">{momData.title}</Text>
          <View className="space-y-2">
            <View className="flex-row items-center gap-x-2">
              <CalendarDays color="#6B7280" size={14} />
              <Text className="text-[13px] text-gray-600">{momData.meetingDate} · {momData.meetingTime}</Text>
            </View>
            <View className="flex-row items-center gap-x-2">
              <MessageSquare color="#6B7280" size={14} />
              <Text className="text-[13px] text-gray-600">{momData.location}</Text>
            </View>
          </View>
        </View>

        {/* Attendees */}
        <View className="mb-6">
          <View className="flex-row items-center gap-x-2 mb-3">
            <Users color="#374151" size={16} />
            <Text className="text-[15px] font-bold text-gray-900">Attendees</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {momData.attendees.map((a, i) => (
              <View key={i} className="flex-row items-center bg-white border border-gray-200 rounded-full pl-1 pr-3 py-1 gap-x-2">
                <View className="w-7 h-7 rounded-full items-center justify-center" style={{ backgroundColor: a.color }}>
                  <Text className="text-white text-[10px] font-bold">{a.initials}</Text>
                </View>
                <View>
                  <Text className="text-[12px] font-semibold text-gray-800">{a.name}</Text>
                  <Text className="text-[10px] text-gray-400">{a.role}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Agenda / Discussion Items */}
        <View>
          <Text className="text-[15px] font-bold text-gray-900 mb-3">Discussion Notes</Text>
          <View className="space-y-4">
            {momData.agendaItems.map((item, index) => (
              <View key={index} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <View className={`flex-row items-center px-4 py-3 gap-x-2 ${item.status === 'resolved' ? 'bg-green-50 border-b border-green-100' : 'bg-orange-50 border-b border-orange-100'}`}>
                  {item.status === 'resolved'
                    ? <CheckCircle2 color="#16A34A" size={15} />
                    : <AlertCircle color="#D97706" size={15} />}
                  <Text className={`text-[13px] font-bold flex-1 ${item.status === 'resolved' ? 'text-green-800' : 'text-orange-800'}`}>
                    {item.topic}
                  </Text>
                  <View className={`rounded-full px-2 py-0.5 ${item.status === 'resolved' ? 'bg-green-200' : 'bg-orange-200'}`}>
                    <Text className={`text-[10px] font-bold ${item.status === 'resolved' ? 'text-green-700' : 'text-orange-700'}`}>
                      {item.status === 'resolved' ? 'Resolved' : 'Action Needed'}
                    </Text>
                  </View>
                </View>

                <View className="p-4">
                  <Text className="text-[12px] text-gray-600 leading-relaxed mb-3">{item.discussion}</Text>

                  <Text className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Decisions</Text>
                  {item.decisions.map((d, di) => (
                    <View key={di} className="flex-row items-start gap-x-2 mb-1">
                      <View className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5" />
                      <Text className="text-[12px] text-gray-700 flex-1 leading-tight">{d}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
