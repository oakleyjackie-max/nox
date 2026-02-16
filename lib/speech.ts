import { Platform } from "react-native";
import * as Speech from "expo-speech";

export interface TTSOptions {
  language: string; // e.g. "en-US", "fr-CA"
  pitch: number; // 0.5 – 2.0 (default 1.0)
  rate: number; // 0.1 – 2.0 (default 1.0)
}

export const DEFAULT_TTS_OPTIONS: TTSOptions = {
  language: "en-US",
  pitch: 1.0,
  rate: 1.0,
};

/**
 * Rate presets matched to sass levels for dramatic effect:
 * - mild: normal speed (1.0)
 * - medium: slightly faster (1.05)
 * - spicy: slightly slower for dramatic delivery (0.95)
 * - unhinged: slow and dramatic (0.9)
 */
export const SASS_RATE_PRESETS: Record<string, number> = {
  mild: 1.0,
  medium: 1.05,
  spicy: 0.95,
  unhinged: 0.9,
};

export const TTS_LANGUAGES = [
  { label: "English (US)", value: "en-US" },
  { label: "English (UK)", value: "en-GB" },
  { label: "English (AU)", value: "en-AU" },
  { label: "French (Canada)", value: "fr-CA" },
  { label: "French (France)", value: "fr-FR" },
  { label: "Spanish (US)", value: "es-US" },
  { label: "Spanish (Spain)", value: "es-ES" },
  { label: "German", value: "de-DE" },
  { label: "Japanese", value: "ja-JP" },
  { label: "Korean", value: "ko-KR" },
] as const;

/**
 * Speak a wake-up message aloud.
 * - Native: uses expo-speech (wraps iOS/Android TTS)
 * - Web: uses the Web Speech API (SpeechSynthesis)
 */
export async function speakMessage(
  message: string,
  options: Partial<TTSOptions> = {}
): Promise<void> {
  const opts = { ...DEFAULT_TTS_OPTIONS, ...options };

  // ── Web: use native Web Speech API ──
  if (Platform.OS === "web") {
    return speakWeb(message, opts);
  }

  // ── Native: use expo-speech ──
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      Speech.stop();
    }
  } catch {}

  return new Promise<void>((resolve) => {
    Speech.speak(message, {
      language: opts.language,
      pitch: opts.pitch,
      rate: opts.rate,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
}

/**
 * Web Speech API implementation
 */
function speakWeb(message: string, opts: TTSOptions): Promise<void> {
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = opts.language;
    utterance.pitch = opts.pitch;
    utterance.rate = opts.rate;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Stop any currently speaking TTS.
 */
export function stopSpeaking(): void {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    return;
  }
  try {
    Speech.stop();
  } catch {}
}
