import React, { useState, useCallback, useRef } from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform, LayoutChangeEvent, TextInput, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { GlassCard } from "@/components/glass/GlassCard";
import { NeonText } from "@/components/ui/NeonText";
import { useTheme } from "@/context/ThemeContext";
import { useLocation } from "@/context/LocationContext";
import { GlowMode, GLOW_COLORS, GLOW_LABELS, GLOW_SHADOW_RADIUS } from "@/lib/constants";
import { SASS_LEVELS, SASS_LABELS, getRandomMessage } from "@/lib/wakeUpMessages";
import type { SassLevel } from "@/lib/wakeUpMessages";
import { TTS_LANGUAGES, speakMessage, validateGoogleTtsKey } from "@/lib/speech";
import { MapPin, Sun, Moon, RefreshCw, Volume2, Key, Check, X, ExternalLink } from "lucide-react-native";
import { NeonIcon } from "@/components/ui/NeonIcon";

const GLOW_MODES: GlowMode[] = ["moonlight", "nightVision", "deepSpace", "radar"];

function safeHaptic(fn: () => void) {
  if (Platform.OS !== "web") {
    try { fn(); } catch {}
  }
}

/**
 * Cross-platform slider component.
 * On web: uses onLayout + click/mouse events with pageX.
 * On native: uses responder events with locationX.
 */
function CrossPlatformSlider({
  value,
  onValueChange,
  accentColor,
  min = 0,
  max = 1,
}: {
  value: number;
  onValueChange: (v: number) => void;
  accentColor: string;
  min?: number;
  max?: number;
}) {
  const trackRef = useRef<View>(null);
  const trackLayoutRef = useRef({ x: 0, width: 280 });

  /** Re-measure track position using getBoundingClientRect on web */
  const remeasure = () => {
    if (Platform.OS === "web" && trackRef.current) {
      const node = trackRef.current as any;
      // React Native Web exposes the underlying DOM node
      const domNode: HTMLElement | null =
        node.getBoundingClientRect ? node : node._nativeTag ?? null;
      if (domNode && typeof domNode.getBoundingClientRect === "function") {
        const rect = domNode.getBoundingClientRect();
        trackLayoutRef.current.x = rect.left;
        trackLayoutRef.current.width = rect.width;
      }
    }
  };

  const computeRatio = (pageX: number) => {
    const { x, width } = trackLayoutRef.current;
    if (width <= 0) return 0;
    return Math.max(0, Math.min(1, (pageX - x) / width));
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    trackLayoutRef.current.width = e.nativeEvent.layout.width;
    // On web, measure using getBoundingClientRect for accurate position
    remeasure();
  };

  const normalizedValue = (value - min) / (max - min);

  const handleWebInteraction = (pageX: number) => {
    // Re-measure every interaction to handle scroll/resize shifts
    remeasure();
    const ratio = computeRatio(pageX);
    onValueChange(min + ratio * (max - min));
  };

  const handleNativeInteraction = (locationX: number) => {
    const ratio = Math.max(0, Math.min(1, locationX / trackLayoutRef.current.width));
    onValueChange(min + ratio * (max - min));
  };

  return (
    <View
      ref={trackRef}
      style={styles.sliderTrack}
      onLayout={handleLayout}
    >
      <View
        style={[
          styles.sliderFill,
          {
            width: `${normalizedValue * 100}%`,
            backgroundColor: accentColor,
          },
        ]}
      />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={(e) => {
          if (Platform.OS === "web") {
            handleWebInteraction((e.nativeEvent as any).pageX);
          } else {
            handleNativeInteraction(e.nativeEvent.locationX);
          }
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          if (Platform.OS === "web") {
            handleWebInteraction((e.nativeEvent as any).pageX);
          } else {
            handleNativeInteraction(e.nativeEvent.locationX);
          }
        }}
        onResponderMove={(e) => {
          if (Platform.OS === "web") {
            handleWebInteraction((e.nativeEvent as any).pageX);
          } else {
            handleNativeInteraction(e.nativeEvent.locationX);
          }
        }}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    glowMode,
    setGlowMode,
    colorScheme,
    setColorScheme,
    isDark,
    dimmer,
    setDimmer,
    colors,
    wakeMessagesEnabled,
    setWakeMessagesEnabled,
    wakeSassLevel,
    setWakeSassLevel,
    ttsEnabled,
    setTtsEnabled,
    ttsOptions,
    setTtsLanguage,
    setTtsPitch,
    setTtsRate,
    googleTtsApiKey,
    setGoogleTtsApiKey,
  } = useTheme();
  const { latitude, longitude, error: locError } = useLocation();

  // Preview message state
  const [previewMessage, setPreviewMessage] = useState(() =>
    getRandomMessage(wakeSassLevel)
  );

  // Google TTS API key input state
  const [apiKeyInput, setApiKeyInput] = useState(googleTtsApiKey);
  const [apiKeyStatus, setApiKeyStatus] = useState<"idle" | "validating" | "valid" | "invalid">(
    googleTtsApiKey ? "valid" : "idle"
  );

  const refreshPreview = useCallback(() => {
    safeHaptic(() => Haptics.selectionAsync());
    setPreviewMessage(getRandomMessage(wakeSassLevel));
  }, [wakeSassLevel]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: 100 },
      ]}
    >
      <NeonText size={15} intensity={0.4} style={styles.header}>
        SETTINGS
      </NeonText>

      {/* Display Mode */}
      <GlassCard>
        <NeonText size={14} intensity={0.5} style={styles.sectionTitle}>
          DISPLAY
        </NeonText>

        {/* Light/Dark Toggle */}
        <View style={styles.toggleRow}>
          <Pressable
            style={[
              styles.toggleBtn,
              !isDark && styles.toggleBtnActive,
              !isDark && { borderColor: colors.accent },
            ]}
            onPress={() => {
              safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
              setColorScheme("light");
            }}
          >
            <Sun size={16} color={!isDark ? colors.accent : colors.textSecondary} />
            <NeonText size={14} intensity={!isDark ? 0.9 : 0.4}>
              Light
            </NeonText>
          </Pressable>
          <Pressable
            style={[
              styles.toggleBtn,
              isDark && styles.toggleBtnActive,
              isDark && { borderColor: colors.accent },
            ]}
            onPress={() => {
              safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
              setColorScheme("dark");
            }}
          >
            <Moon size={16} color={isDark ? colors.accent : colors.textSecondary} />
            <NeonText size={14} intensity={isDark ? 0.9 : 0.4}>
              Dark
            </NeonText>
          </Pressable>
        </View>

        {/* Dimmer Slider */}
        <View style={styles.dimmerSection}>
          <NeonText size={12} intensity={0.4} style={styles.dimmerLabel}>
            DIMMER
          </NeonText>
          <CrossPlatformSlider
            value={dimmer}
            onValueChange={setDimmer}
            accentColor={colors.accent}
          />
          <View style={styles.dimmerLabels}>
            <NeonText size={11} intensity={0.3}>
              Bright
            </NeonText>
            <NeonText size={11} intensity={0.3}>
              {Math.round(dimmer * 100)}%
            </NeonText>
            <NeonText size={11} intensity={0.3}>
              Dim
            </NeonText>
          </View>
        </View>
      </GlassCard>

      {/* Wake-Up Messages */}
      <GlassCard>
        <NeonText size={14} intensity={0.5} style={styles.sectionTitle}>
          WAKE-UP MESSAGES
        </NeonText>

        {/* Enable/Disable Toggle */}
        <View style={styles.toggleRow}>
          <Pressable
            style={[
              styles.toggleBtn,
              wakeMessagesEnabled && styles.toggleBtnActive,
              wakeMessagesEnabled && { borderColor: colors.accent },
            ]}
            onPress={() => {
              safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
              setWakeMessagesEnabled(true);
            }}
          >
            <NeonText size={14} intensity={wakeMessagesEnabled ? 0.9 : 0.4}>
              ON
            </NeonText>
          </Pressable>
          <Pressable
            style={[
              styles.toggleBtn,
              !wakeMessagesEnabled && styles.toggleBtnActive,
              !wakeMessagesEnabled && { borderColor: colors.accent },
            ]}
            onPress={() => {
              safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
              setWakeMessagesEnabled(false);
            }}
          >
            <NeonText size={14} intensity={!wakeMessagesEnabled ? 0.9 : 0.4}>
              OFF
            </NeonText>
          </Pressable>
        </View>

        {/* Sass Level Picker */}
        {wakeMessagesEnabled && (
          <>
            <NeonText size={12} intensity={0.4} style={styles.dimmerLabel}>
              SASS LEVEL
            </NeonText>
            <View style={styles.sassRow}>
              {SASS_LEVELS.map((level) => {
                const active = wakeSassLevel === level;
                return (
                  <Pressable
                    key={level}
                    style={[
                      styles.sassChip,
                      {
                        borderColor: active ? colors.accent : colors.border,
                        backgroundColor: active ? `${colors.accent}20` : "transparent",
                      },
                    ]}
                    onPress={() => {
                      safeHaptic(() => Haptics.selectionAsync());
                      setWakeSassLevel(level);
                      setPreviewMessage(getRandomMessage(level));
                    }}
                  >
                    <NeonText size={13} intensity={active ? 0.9 : 0.4}>
                      {SASS_LABELS[level]}
                    </NeonText>
                  </Pressable>
                );
              })}
            </View>

            {/* Preview */}
            <View style={styles.previewSection}>
              <View style={styles.previewHeader}>
                <NeonText size={12} intensity={0.4} style={styles.dimmerLabel}>
                  PREVIEW
                </NeonText>
                <Pressable onPress={refreshPreview} hitSlop={12}>
                  <RefreshCw size={14} color={colors.textSecondary} />
                </Pressable>
              </View>
              <View style={[styles.previewBox, { borderColor: colors.border }]}>
                <NeonText size={13} intensity={0.6} style={styles.previewText}>
                  {previewMessage}
                </NeonText>
              </View>
            </View>
          </>
        )}
      </GlassCard>

      {/* Text-to-Speech */}
      <GlassCard>
        <NeonText size={14} intensity={0.5} style={styles.sectionTitle}>
          TEXT-TO-SPEECH
        </NeonText>

        {/* TTS Enable/Disable */}
        <View style={styles.toggleRow}>
          <Pressable
            style={[
              styles.toggleBtn,
              ttsEnabled && styles.toggleBtnActive,
              ttsEnabled && { borderColor: colors.accent },
            ]}
            onPress={() => {
              safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
              setTtsEnabled(true);
            }}
          >
            <NeonText size={14} intensity={ttsEnabled ? 0.9 : 0.4}>
              ON
            </NeonText>
          </Pressable>
          <Pressable
            style={[
              styles.toggleBtn,
              !ttsEnabled && styles.toggleBtnActive,
              !ttsEnabled && { borderColor: colors.accent },
            ]}
            onPress={() => {
              safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
              setTtsEnabled(false);
            }}
          >
            <NeonText size={14} intensity={!ttsEnabled ? 0.9 : 0.4}>
              OFF
            </NeonText>
          </Pressable>
        </View>

        {ttsEnabled && (
          <>
            {/* Language Picker */}
            <NeonText size={12} intensity={0.4} style={styles.dimmerLabel}>
              LANGUAGE
            </NeonText>
            <View style={styles.sassRow}>
              {TTS_LANGUAGES.map((lang) => {
                const active = ttsOptions.language === lang.value;
                return (
                  <Pressable
                    key={lang.value}
                    style={[
                      styles.sassChip,
                      {
                        borderColor: active ? colors.accent : colors.border,
                        backgroundColor: active ? `${colors.accent}20` : "transparent",
                      },
                    ]}
                    onPress={() => {
                      safeHaptic(() => Haptics.selectionAsync());
                      setTtsLanguage(lang.value);
                    }}
                  >
                    <NeonText size={12} intensity={active ? 0.9 : 0.4}>
                      {lang.label}
                    </NeonText>
                  </Pressable>
                );
              })}
            </View>

            {/* Pitch Slider */}
            <View style={styles.dimmerSection}>
              <NeonText size={12} intensity={0.4} style={styles.dimmerLabel}>
                PITCH ({ttsOptions.pitch.toFixed(1)})
              </NeonText>
              <CrossPlatformSlider
                value={ttsOptions.pitch}
                onValueChange={setTtsPitch}
                accentColor={colors.accent}
                min={0.5}
                max={2.0}
              />
              <View style={styles.dimmerLabels}>
                <NeonText size={11} intensity={0.3}>Low</NeonText>
                <NeonText size={11} intensity={0.3}>High</NeonText>
              </View>
            </View>

            {/* Rate Slider */}
            <View style={[styles.dimmerSection, { marginTop: 12 }]}>
              <NeonText size={12} intensity={0.4} style={styles.dimmerLabel}>
                SPEED ({ttsOptions.rate.toFixed(1)})
              </NeonText>
              <CrossPlatformSlider
                value={ttsOptions.rate}
                onValueChange={setTtsRate}
                accentColor={colors.accent}
                min={0.5}
                max={2.0}
              />
              <View style={styles.dimmerLabels}>
                <NeonText size={11} intensity={0.3}>Slow</NeonText>
                <NeonText size={11} intensity={0.3}>Fast</NeonText>
              </View>
            </View>

            {/* Test TTS Button */}
            <Pressable
              style={[styles.testTtsBtn, { borderColor: colors.accent }]}
              onPress={() => {
                safeHaptic(() => Haptics.selectionAsync());
                speakMessage(previewMessage, ttsOptions, googleTtsApiKey || undefined);
              }}
            >
              <Volume2 size={16} color={colors.accent} />
              <NeonText size={13} intensity={0.7}>
                Test Voice
              </NeonText>
            </Pressable>

            {/* Google Cloud TTS API Key */}
            <View style={styles.googleTtsSection}>
              <View style={styles.googleTtsHeader}>
                <Key size={14} color={colors.textSecondary} />
                <NeonText size={12} intensity={0.4} style={styles.dimmerLabel}>
                  GOOGLE CLOUD TTS
                </NeonText>
                {googleTtsApiKey ? (
                  <View style={styles.statusBadge}>
                    <Check size={10} color="#39FF14" />
                    <NeonText size={10} intensity={0.7} style={{ color: "#39FF14" }}>
                      Connected
                    </NeonText>
                  </View>
                ) : (
                  <NeonText size={10} intensity={0.3}>
                    Not configured
                  </NeonText>
                )}
              </View>
              <NeonText size={11} intensity={0.3} style={{ marginBottom: 8, lineHeight: 16 }}>
                Add your Google Cloud API key for premium Neural2 voices.
                Free tier includes ~6,600 alarm messages/month.
              </NeonText>
              <View style={[styles.apiKeyInputRow, { borderColor: colors.border }]}>
                <TextInput
                  style={[styles.apiKeyInput, { color: colors.text }]}
                  value={apiKeyInput}
                  onChangeText={setApiKeyInput}
                  placeholder="Paste API key here..."
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={styles.apiKeyActions}>
                <Pressable
                  style={[styles.apiKeyBtn, { borderColor: colors.accent, opacity: apiKeyStatus === "validating" ? 0.5 : 1 }]}
                  onPress={async () => {
                    if (!apiKeyInput.trim()) return;
                    setApiKeyStatus("validating");
                    safeHaptic(() => Haptics.selectionAsync());
                    const isValid = await validateGoogleTtsKey(apiKeyInput.trim());
                    if (isValid) {
                      setGoogleTtsApiKey(apiKeyInput.trim());
                      setApiKeyStatus("valid");
                    } else {
                      setApiKeyStatus("invalid");
                    }
                  }}
                  disabled={apiKeyStatus === "validating"}
                >
                  <NeonText size={12} intensity={0.7}>
                    {apiKeyStatus === "validating" ? "Validating..." : "Save"}
                  </NeonText>
                </Pressable>
                {googleTtsApiKey ? (
                  <Pressable
                    style={[styles.apiKeyBtn, { borderColor: "#FF3131" }]}
                    onPress={() => {
                      safeHaptic(() => Haptics.selectionAsync());
                      setGoogleTtsApiKey("");
                      setApiKeyInput("");
                      setApiKeyStatus("idle");
                    }}
                  >
                    <X size={12} color="#FF3131" />
                    <NeonText size={12} intensity={0.7} style={{ color: "#FF3131" }}>
                      Clear
                    </NeonText>
                  </Pressable>
                ) : null}
              </View>
              {apiKeyStatus === "invalid" && (
                <NeonText size={11} intensity={0.6} style={{ color: "#FF3131", marginTop: 4 }}>
                  Invalid API key. Check that the key is correct and the Text-to-Speech API is enabled.
                </NeonText>
              )}
              <Pressable
                style={styles.helpLink}
                onPress={() => {
                  if (Platform.OS === "web") {
                    window.open("https://console.cloud.google.com/apis/library/texttospeech.googleapis.com", "_blank");
                  } else {
                    Linking.openURL("https://console.cloud.google.com/apis/library/texttospeech.googleapis.com");
                  }
                }}
              >
                <ExternalLink size={11} color={colors.accent} />
                <NeonText size={11} intensity={0.5} style={{ color: colors.accent }}>
                  How to get a free API key
                </NeonText>
              </Pressable>
            </View>
          </>
        )}
      </GlassCard>

      {/* Theme Picker — only show in dark mode */}
      {isDark && (
        <GlassCard>
          <NeonText size={14} intensity={0.5} style={styles.sectionTitle}>
            GLOW THEME
          </NeonText>
          <View style={styles.themeGrid}>
            {GLOW_MODES.map((mode) => {
              const color = GLOW_COLORS[mode];
              const active = glowMode === mode;
              return (
                <Pressable
                  key={mode}
                  style={[
                    styles.themeCard,
                    {
                      borderColor: active ? color : colors.border,
                      backgroundColor: active ? `${color}15` : "transparent",
                    },
                  ]}
                  onPress={() => {
                    safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
                    setGlowMode(mode);
                  }}
                >
                  <View
                    style={[
                      styles.colorDot,
                      {
                        backgroundColor: color,
                        shadowColor: color,
                        shadowRadius: GLOW_SHADOW_RADIUS[mode],
                        shadowOpacity: 0.8,
                        shadowOffset: { width: 0, height: 0 },
                      },
                    ]}
                  />
                  <NeonText
                    size={14}
                    intensity={active ? 1 : 0.4}
                    style={{ color }}
                  >
                    {GLOW_LABELS[mode]}
                  </NeonText>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>
      )}

      {/* Location */}
      <GlassCard>
        <NeonText size={14} intensity={0.5} style={styles.sectionTitle}>
          LOCATION
        </NeonText>
        <View style={styles.locationRow}>
          <NeonIcon icon={MapPin} size={18} intensity={0.6} />
          <NeonText size={15} intensity={0.6}>
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </NeonText>
        </View>
        {locError && (
          <NeonText size={13} intensity={0.4} style={{ marginTop: 8, color: "#FF3131" }}>
            {locError}
          </NeonText>
        )}
      </GlassCard>

      {/* About */}
      <GlassCard>
        <NeonText size={14} intensity={0.5} style={styles.sectionTitle}>
          ABOUT
        </NeonText>
        <NeonText size={15} intensity={0.4}>
          Nox v1.2.0
        </NeonText>
        <NeonText size={13} intensity={0.3} style={{ marginTop: 4 }}>
          Celestial Alarm & Utility App
        </NeonText>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    gap: 16,
  },
  header: {
    letterSpacing: 4,
    textTransform: "uppercase",
    textAlign: "center",
  },
  sectionTitle: {
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  toggleBtnActive: {
    backgroundColor: "rgba(255,215,0,0.08)",
  },
  dimmerSection: {
    gap: 6,
  },
  dimmerLabel: {
    letterSpacing: 2,
  },
  sliderTrack: {
    height: 12,
    maxWidth: "100%",
    borderRadius: 6,
    backgroundColor: "rgba(128,128,128,0.2)",
    overflow: "hidden",
    position: "relative",
    // @ts-ignore web cursor
    cursor: Platform.OS === "web" ? "pointer" : undefined,
  },
  sliderFill: {
    height: "100%",
    borderRadius: 6,
  },
  dimmerLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sassRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  sassChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewSection: {
    gap: 8,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  previewText: {
    lineHeight: 20,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  themeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 150,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    elevation: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  testTtsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  googleTtsSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  googleTtsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  apiKeyInputRow: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  apiKeyInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: Platform.OS === "web" ? "monospace" : "SpaceMono",
  },
  apiKeyActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  apiKeyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  helpLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
});
