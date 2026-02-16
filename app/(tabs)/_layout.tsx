import React from "react";
import { Tabs } from "expo-router";
import { GlassTabBar } from "@/components/glass/GlassTabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Clock" }} />
      <Tabs.Screen name="weather" options={{ title: "Weather" }} />
      <Tabs.Screen name="alarms" options={{ title: "Alarms" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
