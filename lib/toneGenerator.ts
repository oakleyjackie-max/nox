import { Paths, File, Directory } from "expo-file-system";

// Generates minimal WAV audio files procedurally for each alarm theme.
// Each theme uses a different waveform character via additive sine synthesis.

const SAMPLE_RATE = 22050;
const DURATION_SEC = 2; // each loop is 2 seconds
const NUM_SAMPLES = SAMPLE_RATE * DURATION_SEC;

type WaveformFn = (t: number) => number;

// Theme waveforms — each has a distinct character
const WAVEFORMS: Record<string, WaveformFn> = {
  // Pulsar: sharp rhythmic beeps (square-ish wave with amplitude modulation)
  pulsar: (t) => {
    const beepRate = 4; // 4 beeps per second
    const envelope = Math.sin(Math.PI * ((t * beepRate) % 1)) > 0.3 ? 1 : 0;
    return envelope * Math.sin(2 * Math.PI * 880 * t) * 0.7;
  },
  // Nebula: warm soft pad (layered detuned sines)
  nebula: (t) => {
    const a = Math.sin(2 * Math.PI * 330 * t);
    const b = Math.sin(2 * Math.PI * 333 * t);
    const c = Math.sin(2 * Math.PI * 440 * t) * 0.5;
    const fade = Math.sin(Math.PI * (t / DURATION_SEC));
    return (a + b + c) / 3 * fade * 0.6;
  },
  // Quasar: rising frequency sweep
  quasar: (t) => {
    const freq = 220 + 660 * (t / DURATION_SEC);
    const mod = Math.sin(2 * Math.PI * 6 * t) * 0.3 + 0.7;
    return Math.sin(2 * Math.PI * freq * t) * mod * 0.65;
  },
  // Saturn: deep low hum with overtone rings
  saturn: (t) => {
    const fundamental = Math.sin(2 * Math.PI * 110 * t);
    const ring1 = Math.sin(2 * Math.PI * 220 * t) * 0.4;
    const ring2 = Math.sin(2 * Math.PI * 330 * t) * 0.2;
    const throb = Math.sin(2 * Math.PI * 1.5 * t) * 0.3 + 0.7;
    return (fundamental + ring1 + ring2) / 1.6 * throb * 0.6;
  },
};

function generateSamples(waveformFn: WaveformFn): Int16Array {
  const samples = new Int16Array(NUM_SAMPLES);
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const val = Math.max(-1, Math.min(1, waveformFn(t)));
    samples[i] = Math.round(val * 32767);
  }
  return samples;
}

function int16ToBytes(val: number): [number, number] {
  return [val & 0xff, (val >> 8) & 0xff];
}

function int32ToBytes(val: number): [number, number, number, number] {
  return [val & 0xff, (val >> 8) & 0xff, (val >> 16) & 0xff, (val >> 24) & 0xff];
}

function buildWavBytes(samples: Int16Array): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * (bitsPerSample / 8);
  const headerSize = 44;

  const buffer = new Uint8Array(headerSize + dataSize);
  let offset = 0;

  const writeStr = (s: string) => {
    for (let i = 0; i < s.length; i++) buffer[offset++] = s.charCodeAt(i);
  };
  const write16 = (v: number) => {
    const [a, b] = int16ToBytes(v);
    buffer[offset++] = a;
    buffer[offset++] = b;
  };
  const write32 = (v: number) => {
    const [a, b, c, d] = int32ToBytes(v);
    buffer[offset++] = a;
    buffer[offset++] = b;
    buffer[offset++] = c;
    buffer[offset++] = d;
  };

  // RIFF header
  writeStr("RIFF");
  write32(headerSize + dataSize - 8);
  writeStr("WAVE");

  // fmt chunk
  writeStr("fmt ");
  write32(16); // chunk size
  write16(1); // PCM format
  write16(numChannels);
  write32(SAMPLE_RATE);
  write32(byteRate);
  write16(blockAlign);
  write16(bitsPerSample);

  // data chunk
  writeStr("data");
  write32(dataSize);
  for (let i = 0; i < samples.length; i++) {
    write16(samples[i]);
  }

  return buffer;
}

const fileCache: Record<string, string> = {};

/**
 * Generates a WAV file for the given alarm theme and returns a file:// URI.
 * Files are cached to disk so generation only happens once per session.
 */
export async function getToneUri(theme: string): Promise<string> {
  if (fileCache[theme]) return fileCache[theme];

  const waveformFn = WAVEFORMS[theme] ?? WAVEFORMS.nebula;
  const samples = generateSamples(waveformFn);
  const wavBytes = buildWavBytes(samples);

  const dir = new Directory(Paths.cache, "nox-tones");
  if (!dir.exists) {
    dir.create();
  }

  const file = new File(dir, `${theme}.wav`);
  const stream = file.writableStream();
  const writer = stream.getWriter();
  await writer.write(new Uint8Array(wavBytes.buffer as ArrayBuffer));
  await writer.close();

  fileCache[theme] = file.uri;
  return file.uri;
}
