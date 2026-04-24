import "../global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/useAppTheme";
import { useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";


function useAuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const [isChecking, setIsChecking] = useState(true);

  const checkAndRedirect = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const hasToken = !!token;
      const currentSegment = segments[0];
      const inLoginPage = currentSegment === "login";
      const inIndexPage = currentSegment === undefined;

      if (!hasToken && !inLoginPage) {
        router.replace("/login");
      } else if (hasToken && inLoginPage) {
        router.replace("/");
      }
    } catch {
      const inLoginPage = segments[0] === "login";
      if (!inLoginPage) {
        router.replace("/login");
      }
    } finally {
      setIsChecking(false);
    }
  }, [segments, router]);

  useEffect(() => {
    checkAndRedirect();
  }, [checkAndRedirect]);

  return { isChecking };
}

export default function Layout() {
  const { isDark, c, colors } = useTheme();
  const { isChecking } = useAuthGuard();

  if (isChecking) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: c.background }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: c.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Slot />
    </View>
  );
}