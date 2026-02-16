import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
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
  setWebAlarmCallback,
} from "@/lib/notifications";
import { speakMessage, SASS_RATE_PRESETS } from "@/lib/speech";
import { NeonText } from "@/components/ui/NeonText";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

/** TTS Banner — shows wake-up message text on screen */
function TTSBanner({
  message,
  visible,
  onDismiss,
}: {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 400 });
      // Auto-dismiss after 10 seconds
      opacity.value = withDelay(
        9000,
        withTiming(0, { duration: 1000 })
      );
    } else {
      opacity.value = withTiming(0, { duration: 400 });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: opacity.value > 0.1 ? "auto" as const : "none" as const,
  }));

  if (!message) return null;

  return (
    <Animated.View style={[styles.bannerContainer, animStyle]}>
      <Pressable onPress={onDismiss} style={styles.bannerPressable}>
        <View style={styles.bannerCard}>
          <NeonText size={12} intensity={0.5} style={styles.bannerTitle}>
            ⏰ NOX ALARM
          </NeonText>
          <NeonText size={18} intensity={0.9} style={styles.bannerMessage}>
            {message}
          </NeonText>
          <NeonText size={11} intensity={0.3} style={styles.bannerHint}>
            Tap to dismiss
          </NeonText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function RootInner() {
  const { isDark, dimmer, colors, ttsEnabled, ttsOptions, wakeSassLevel, googleTtsApiKey } = useTheme();
  const ttsEnabledRef = useRef(ttsEnabled);
  const ttsOptionsRef = useRef(ttsOptions);
  const sassLevelRef = useRef(wakeSassLevel);
  const googleTtsApiKeyRef = useRef(googleTtsApiKey);

  // TTS Banner state
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerVisible, setBannerVisible] = useState(false);

  const showBanner = useCallback((message: string) => {
    setBannerMessage(message);
    setBannerVisible(true);
    // Auto-hide after 10 seconds
    setTimeout(() => setBannerVisible(false), 10000);
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
  }, []);

  // Keep refs in sync so notification listeners have fresh values
  useEffect(() => { ttsEnabledRef.current = ttsEnabled; }, [ttsEnabled]);
  useEffect(() => { ttsOptionsRef.current = ttsOptions; }, [ttsOptions]);
  useEffect(() => { sassLevelRef.current = wakeSassLevel; }, [wakeSassLevel]);
  useEffect(() => { googleTtsApiKeyRef.current = googleTtsApiKey; }, [googleTtsApiKey]);

  // Handle alarm trigger (both web and native)
  const handleAlarmTrigger = useCallback((body: string) => {
    // Show visual banner
    showBanner(body);

    // Speak if TTS enabled
    if (ttsEnabledRef.current) {
      const sassRate = SASS_RATE_PRESETS[sassLevelRef.current] ?? 1.0;
      speakMessage(body, {
        ...ttsOptionsRef.current,
        rate: ttsOptionsRef.current.rate * sassRate,
      }, googleTtsApiKeyRef.current || undefined);
    }
  }, [showBanner]);

  // Register web alarm callback
  useEffect(() => {
    if (Platform.OS === "web") {
      setWebAlarmCallback((_title, body, _alarmId) => {
        handleAlarmTrigger(body);
      });
      return () => setWebAlarmCallback(null);
    }
  }, [handleAlarmTrigger]);

  // Native: TTS on notification received (app in foreground)
  useEffect(() => {
    const receivedSub = addNotificationReceivedListener((notification) => {
      const body = notification.request.content.body;
      if (body && notification.request.content.data?.alarmId) {
        handleAlarmTrigger(body);
      }
    });

    // TTS on notification tap (app was in background or closed)
    const responseSub = addNotificationResponseListener((response) => {
      const body = response.notification.request.content.body;
      if (body && response.notification.request.content.data?.alarmId) {
        handleAlarmTrigger(body);
      }
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [handleAlarmTrigger]);

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

      {/* TTS / Alarm Banner */}
      <TTSBanner
        message={bannerMessage}
        visible={bannerVisible}
        onDismiss={dismissBanner}
      />

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
  bannerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  bannerPressable: {
    width: "80%",
    maxWidth: 400,
  },
  bannerCard: {
    backgroundColor: "rgba(0,15,40,0.9)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
    padding: 32,
    alignItems: "center",
    gap: 12,
    // @ts-ignore web CSS
    backdropFilter: "blur(20px)",
    // @ts-ignore web CSS
    WebkitBackdropFilter: "blur(20px)",
  },
  bannerTitle: {
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  bannerMessage: {
    textAlign: "center",
    lineHeight: 28,
  },
  bannerHint: {
    marginTop: 8,
  },
});
