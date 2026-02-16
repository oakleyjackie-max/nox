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
 * Speak a wake-up message aloud using the device's TTS engine.
 * Fully offline — uses expo-speech which wraps native TTS.
 */
export async function speakMessage(
  message: string,
  options: Partial<TTSOptions> = {}
): Promise<void> {
  const opts = { ...DEFAULT_TTS_OPTIONS, ...options };

  // Stop any currently speaking utterance first
  const isSpeaking = await Speech.isSpeakingAsync();
  if (isSpeaking) {
    Speech.stop();
  }

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
 * Stop any currently speaking TTS.
 */
export function stopSpeaking(): void {
  Speech.stop();
}
