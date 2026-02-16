import React, { useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Timer, Gauge } from "lucide-react-native";
import { NeonText } from "@/components/ui/NeonText";
import { useTheme } from "@/context/ThemeContext";
import { Stopwatch } from "./Stopwatch";
import { TimerStack } from "./TimerStack";

const DRAWER_WIDTH = 400;

type ToolTab = "stopwatch" | "timers";

export function ToolsDrawer() {
  const { width: screenWidth } = useWindowDimensions();
  const { glowColor } = useTheme();
  const translateX = useSharedValue(DRAWER_WIDTH);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ToolTab>("stopwatch");

  const open = () => {
    translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    setIsOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      {/* Edge Handle */}
      {!isOpen && (
        <Pressable style={styles.handle} onPress={open}>
          <View
            style={[
              styles.handleBar,
              { backgroundColor: `${glowColor}60` },
            ]}
          />
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
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
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
                Haptics.selectionAsync();
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
                Haptics.selectionAsync();
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
    top: "40%",
    width: 24,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  handleBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
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
