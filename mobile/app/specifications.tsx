import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image,  Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useRouter } from 'expo-router';
import { 
  Shield, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Filter, 
  User, 
  Clock, 
  ChevronRight, 
  Home, 
  File, 
  UserCircle 
} from 'lucide-react-native';

export default function SpecificationsScreen() {
  
  const documents = [
    { title: "E-Commerce Platform Requirem", author: "Sarah Jenkins", date: "Oct 24, 2023", status: "Pending" },
    { title: "Mobile App API Specification", author: "Michael Chen", date: "Oct 22, 2023", status: "Reviewed" },
    { title: "User Authentication Protocol", author: "Robert Taylor", date: "Oct 20, 2023", status: "Reviewed" },
    { title: "Payment Gateway Integration", author: "Sarah Jenkins", date: "Oct 18, 2023", status: "Pending" },
    { title: "Inventory Management Logic", author: "David Miller", date: "Oct 15, 2023", status: "Reviewed" },
    { title: "Cloud Migration Strategy", author: "Emily Watson", date: "Oct 12, 2023", status: "Pending" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white pt-8">
      
      
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
        <View className="w-10 h-10 bg-[#1A1D21] rounded-xl justify-center items-center">
          <Shield color="white" size={20} />
        </View>
        
        <Text className="text-[17px] font-bold text-gray-900">Specifications</Text>
        
        <View className="relative">
          <Image 
            source={{ uri: 'https://i.pravatar.cc/100?img=11' }} 
            className="w-10 h-10 rounded-full"
          />
         
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        </View>
      </View>

     
      <ScrollView 
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} 
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
            <Text className="text-[10px] font-bold text-gray-500 mt-1">PENDING</Text>
          </View>
          
          <View className="flex-1 bg-white border border-gray-200 rounded-2xl py-4 items-center shadow-sm">
            <CheckCircle2 color="#4B5563" size={20} className="mb-2" />
            <Text className="text-xl font-bold text-gray-900">16</Text>
            <Text className="text-[10px] font-bold text-gray-500 mt-1">REVIEWED</Text>
          </View>
        </View>

      
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-900">Recent Documents</Text>
          <TouchableOpacity className="flex-row items-center">
            <Filter color="#3B82F6" size={14} />
            <Text className="text-sm text-blue-500 font-medium ml-1">Filter</Text>
          </TouchableOpacity>
        </View>

       
        <View className="space-y-3">
          {documents.map((doc, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => router.push('/details')}  
            className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-center shadow-sm mb-3"
            >
              <View className="flex-1 pr-4">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-[15px] font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>
                    {doc.title}
                  </Text>
                  <View className="border border-gray-200 rounded-full px-2 py-1">
                    <Text className="text-[10px] font-medium text-gray-600">{doc.status}</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center">
                  <View className="flex-row items-center mr-4">
                    <User color="#9CA3AF" size={12} />
                    <Text className="text-xs text-gray-500 ml-1">{doc.author}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Clock color="#9CA3AF" size={12} />
                    <Text className="text-xs text-gray-500 ml-1">{doc.date}</Text>
                  </View>
                </View>
              </View>
              
              <ChevronRight color="#D1D5DB" size={20} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

    
      <View className={`flex-row justify-around items-center bg-white border-t border-gray-100 px-6 pt-3 ${Platform.OS === 'ios' ? 'pb-8' : 'pb-4'} absolute bottom-0 w-full`}>
        <TouchableOpacity className="items-center">
          <Home color="#3B82F6" size={24} />
          <Text className="text-[10px] font-medium text-blue-500 mt-1">Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <File color="#6B7280" size={24} />
          <Text className="text-[10px] font-medium text-gray-500 mt-1">Doc</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <UserCircle color="#6B7280" size={24} />
          <Text className="text-[10px] font-medium text-gray-500 mt-1">Profile</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}