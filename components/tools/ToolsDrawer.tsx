import React, { useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Timer, Gauge, ChevronLeft } from "lucide-react-native";
import { NeonText } from "@/components/ui/NeonText";
import { useTheme } from "@/context/ThemeContext";
import { Stopwatch } from "./Stopwatch";
import { TimerStack } from "./TimerStack";

const DRAWER_WIDTH = 400;

type ToolTab = "stopwatch" | "timers";

function safeHaptic(fn: () => void) {
  if (Platform.OS !== "web") {
    try { fn(); } catch {}
  }
}

export function ToolsDrawer() {
  const { width: screenWidth } = useWindowDimensions();
  const { glowColor, isDark } = useTheme();
  const translateX = useSharedValue(DRAWER_WIDTH);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ToolTab>("stopwatch");

  // Pulsing animation for the handle
  const pulse = useSharedValue(0.4);
  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  const open = () => {
    translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    setIsOpen(true);
    safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  };

  const close = () => {
    translateX.value = withSpring(DRAWER_WIDTH, { damping: 20, stiffness: 200 });
    setIsOpen(false);
  };

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <>
      {/* Edge Handle — enlarged & animated for web visibility */}
      {!isOpen && (
        <Pressable style={styles.handle} onPress={open}>
          <Animated.View
            style={[
              styles.handleInner,
              { backgroundColor: `${glowColor}30`, borderColor: `${glowColor}50` },
              pulseStyle,
            ]}
          >
            <ChevronLeft size={16} color={glowColor} />
            <NeonText
              size={10}
              intensity={0.6}
              style={styles.handleLabel}
            >
              Tools
            </NeonText>
          </Animated.View>
        </Pressable>
      )}

      {/* Backdrop */}
      {isOpen && (
        <Pressable style={styles.backdrop} onPress={close}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.4)" }]} />
        </Pressable>
      )}

      {/* Drawer */}
      <Animated.View style={[styles.drawer, { width: DRAWER_WIDTH }, drawerStyle]}>
        {Platform.OS === "web" ? (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark ? "rgba(0,15,40,0.75)" : "rgba(255,255,255,0.6)",
                // @ts-ignore web-only CSS
                backdropFilter: "blur(25px)",
                // @ts-ignore web-only CSS
                WebkitBackdropFilter: "blur(25px)",
              },
            ]}
          />
        ) : (
          <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        <View style={styles.specular} />

        <View style={styles.content}>
          {/* Tab Selector */}
          <View style={styles.tabRow}>
            <Pressable
              style={[
                styles.tab,
                activeTab === "stopwatch" && {
                  borderBottomColor: glowColor,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => {
                setActiveTab("stopwatch");
                safeHaptic(() => Haptics.selectionAsync());
              }}
            >
              <Gauge size={18} color={activeTab === "stopwatch" ? glowColor : "rgba(255,255,255,0.4)"} />
              <NeonText
                size={13}
                intensity={activeTab === "stopwatch" ? 0.9 : 0.3}
              >
                Stopwatch
              </NeonText>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === "timers" && {
                  borderBottomColor: glowColor,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => {
                setActiveTab("timers");
                safeHaptic(() => Haptics.selectionAsync());
              }}
            >
              <Timer size={18} color={activeTab === "timers" ? glowColor : "rgba(255,255,255,0.4)"} />
              <NeonText
                size={13}
                intensity={activeTab === "timers" ? 0.9 : 0.3}
              >
                Timers
              </NeonText>
            </Pressable>
          </View>

          {/* Content */}
          {activeTab === "stopwatch" ? <Stopwatch /> : <TimerStack />}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  handle: {
    position: "absolute",
    right: 0,
    top: "35%",
    width: 44,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  handleInner: {
    width: 36,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  handleLabel: {
    letterSpacing: 1,
    // @ts-ignore web-only
    writingDirection: "ltr",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 300,
    overflow: "hidden",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255, 255, 255, 0.1)",
  },
  specular: {
    ...StyleSheet.absoluteFillObject,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255, 255, 255, 0.08)",
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 12,
  },
  tabRow: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 12,
  },
});
