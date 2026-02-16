import React from "react";
import { View, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "@/global.css";

import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { LocationProvider } from "@/context/LocationContext";
import { SkySyncBackground } from "@/components/sky/SkySyncBackground";
import { ParallaxStarfield } from "@/components/sky/ParallaxStarfield";
import { ToolsDrawer } from "@/components/tools/ToolsDrawer";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

function RootInner() {
  const { isDark, dimmer, colors } = useTheme();

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
