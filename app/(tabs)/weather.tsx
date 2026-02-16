import React from "react";
import { View, StyleSheet, RefreshControl, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard } from "@/components/glass/GlassCard";
import { WeatherCardContent } from "@/components/weather/WeatherCard";
import { HourlyForecast } from "@/components/weather/HourlyForecast";
import { NeonText } from "@/components/ui/NeonText";
import { useWeather } from "@/hooks/useWeather";
import { useTheme } from "@/context/ThemeContext";

export default function WeatherScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, error, refresh } = useWeather();
  const { glowColor } = useTheme();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: 100 },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={loading && !!data}
          onRefresh={refresh}
          tintColor={glowColor}
        />
      }
    >
      <NeonText size={13} intensity={0.4} style={styles.header}>
        WEATHER
      </NeonText>

      {loading && !data ? (
        <View style={styles.center}>
          <ActivityIndicator color={glowColor} size="large" />
          <NeonText size={14} intensity={0.4} style={{ marginTop: 12 }}>
            Loading weather...
          </NeonText>
        </View>
      ) : error && !data ? (
        <GlassCard>
          <NeonText size={14} intensity={0.6}>
            {error}
          </NeonText>
        </GlassCard>
      ) : data ? (
        <>
          <GlassCard style={styles.currentCard}>
            <WeatherCardContent current={data.current} />
          </GlassCard>

          <NeonText size={13} intensity={0.4} style={styles.subHeader}>
            HOURLY FORECAST
          </NeonText>
          <HourlyForecast hourly={data.hourly} />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  header: {
    letterSpacing: 4,
    textTransform: "uppercase",
    textAlign: "center",
  },
  subHeader: {
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: 8,
  },
  currentCard: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 500,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
});
