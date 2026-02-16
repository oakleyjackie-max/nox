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

// ── Google Cloud TTS Neural2 voice mapping ──────────────────
const GOOGLE_VOICE_MAP: Record<string, string> = {
  "en-US": "en-US-Neural2-D",
  "en-GB": "en-GB-Neural2-B",
  "en-AU": "en-AU-Neural2-B",
  "fr-CA": "fr-CA-Neural2-D",
  "fr-FR": "fr-FR-Neural2-D",
  "es-US": "es-US-Neural2-B",
  "es-ES": "es-ES-Neural2-B",
  "de-DE": "de-DE-Neural2-D",
  "ja-JP": "ja-JP-Neural2-D",
  "ko-KR": "ko-KR-Neural2-C",
};

/**
 * Speak a wake-up message aloud.
 * - If googleApiKey is provided → Google Cloud TTS Neural2 (premium)
 * - On web without key → best available browser voice (smart selection)
 * - On native → expo-speech
 */
export async function speakMessage(
  message: string,
  options: Partial<TTSOptions> = {},
  googleApiKey?: string
): Promise<void> {
  const opts = { ...DEFAULT_TTS_OPTIONS, ...options };

  // ── Web path ──
  if (Platform.OS === "web") {
    // Try Google Cloud TTS if API key is set
    if (googleApiKey) {
      try {
        await speakGoogleCloud(message, opts, googleApiKey);
        return;
      } catch {
        // Fall through to browser voice on any error
      }
    }
    return speakWebSmart(message, opts);
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

// ── Google Cloud TTS ────────────────────────────────────────

async function speakGoogleCloud(
  message: string,
  opts: TTSOptions,
  apiKey: string
): Promise<void> {
  const voiceName = GOOGLE_VOICE_MAP[opts.language] ?? "en-US-Neural2-D";
  const langCode = opts.language.substring(0, 5); // "en-US" from "en-US"

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text: message },
        voice: { languageCode: langCode, name: voiceName },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: opts.rate,
          pitch: (opts.pitch - 1) * 4, // Convert 0.5-2.0 → -2 to +4 semitones
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Google TTS ${res.status}: ${err}`);
  }

  const { audioContent } = await res.json();
  const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);

  return new Promise<void>((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Audio playback failed"));
    audio.play().catch(reject);
  });
}

/**
 * Validate a Google Cloud TTS API key by making a minimal request.
 * Returns true if valid, false otherwise.
 */
export async function validateGoogleTtsKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text: "test" },
          voice: { languageCode: "en-US", name: "en-US-Neural2-D" },
          audioConfig: { audioEncoding: "MP3" },
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ── Smart browser voice selection ───────────────────────────

/** Cached best voices per language to avoid re-scanning */
let voiceCache: Record<string, SpeechSynthesisVoice | null> = {};

function getBestVoice(lang: string): SpeechSynthesisVoice | null {
  if (voiceCache[lang] !== undefined) return voiceCache[lang];

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // Filter to matching language
  const langPrefix = lang.substring(0, 2).toLowerCase();
  const matching = voices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith(langPrefix) ||
      v.lang.toLowerCase().replace("_", "-").startsWith(lang.toLowerCase())
  );

  if (matching.length === 0) {
    voiceCache[lang] = null;
    return null;
  }

  // Prefer voices with "Neural", "Premium", "Enhanced", "Natural" in name
  const premiumKeywords = ["neural", "premium", "enhanced", "natural", "wavenet"];
  const premium = matching.find((v) =>
    premiumKeywords.some((kw) => v.name.toLowerCase().includes(kw))
  );

  if (premium) {
    voiceCache[lang] = premium;
    return premium;
  }

  // Prefer non-local (remote/cloud) voices — often higher quality
  const remote = matching.find((v) => !v.localService);
  if (remote) {
    voiceCache[lang] = remote;
    return remote;
  }

  // Fallback to first matching voice
  voiceCache[lang] = matching[0];
  return matching[0];
}

/**
 * Upgraded Web Speech API — auto-selects the best available voice
 */
function speakWebSmart(message: string, opts: TTSOptions): Promise<void> {
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = opts.language;
    utterance.pitch = opts.pitch;
    utterance.rate = opts.rate;

    // Try to assign the best available voice
    const bestVoice = getBestVoice(opts.language);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

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
