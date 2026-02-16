import React from "react";
import { View, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "@/global.css";

import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { LocationProvider } from "@/context/LocationContext";
import { SkySyncBackground } from "@/components/sky/SkySyncBackground";
import { ParallaxStarfield } from "@/components/sky/ParallaxStarfield";
import { ToolsDrawer } from "@/components/tools/ToolsDrawer";
import {
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from "@/lib/notifications";
import { speakMessage, SASS_RATE_PRESETS } from "@/lib/speech";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

function RootInner() {
  const { isDark, dimmer, colors, ttsEnabled, ttsOptions, wakeSassLevel } = useTheme();
  const ttsEnabledRef = useRef(ttsEnabled);
  const ttsOptionsRef = useRef(ttsOptions);
  const sassLevelRef = useRef(wakeSassLevel);

  // Keep refs in sync so notification listeners have fresh values
  useEffect(() => { ttsEnabledRef.current = ttsEnabled; }, [ttsEnabled]);
  useEffect(() => { ttsOptionsRef.current = ttsOptions; }, [ttsOptions]);
  useEffect(() => { sassLevelRef.current = wakeSassLevel; }, [wakeSassLevel]);

  // TTS on notification received (app in foreground)
  useEffect(() => {
    const receivedSub = addNotificationReceivedListener((notification) => {
      if (!ttsEnabledRef.current) return;
      const body = notification.request.content.body;
      if (body && notification.request.content.data?.alarmId) {
        // Apply sass-level rate preset, merged with user options
        const sassRate = SASS_RATE_PRESETS[sassLevelRef.current] ?? 1.0;
        speakMessage(body, {
          ...ttsOptionsRef.current,
          rate: ttsOptionsRef.current.rate * sassRate,
        });
      }
    });

    // TTS on notification tap (app was in background or closed)
    const responseSub = addNotificationResponseListener((response) => {
      if (!ttsEnabledRef.current) return;
      const body = response.notification.request.content.body;
      if (body && response.notification.request.content.data?.alarmId) {
        const sassRate = SASS_RATE_PRESETS[sassLevelRef.current] ?? 1.0;
        speakMessage(body, {
          ...ttsOptionsRef.current,
          rate: ttsOptionsRef.current.rate * sassRate,
        });
      }
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Sky background layers — only in dark mode */}
      {isDark && <SkySyncBackground />}
      {isDark && <ParallaxStarfield />}

      {/* Main content */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>

      {/* Dimmer overlay — dark mode only */}
      {isDark && dimmer > 0 && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: `rgba(0,0,0,${dimmer * 0.8})`, pointerEvents: "none" },
          ]}
        />
      )}

      {/* Tools Drawer overlay */}
      <ToolsDrawer />

      <StatusBar style={isDark ? "light" : "dark"} />
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <LocationProvider>
        <RootInner />
      </LocationProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
