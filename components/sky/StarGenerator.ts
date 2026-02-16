export interface Star {
  id: number;
  x: number; // 0–1 fraction of width
  y: number; // 0–1 fraction of height
  size: number; // radius in px
  opacity: number; // 0–1
  twinkleSpeed: number; // ms per cycle
}

// Simple seeded pseudo-random for deterministic star positions
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateStars(count: number, seed: number = 42): Star[] {
  const rand = seededRandom(seed);
  const stars: Star[] = [];

  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: rand(),
      y: rand(),
      size: 1 + rand() * 2,
      opacity: 0.3 + rand() * 0.7,
      twinkleSpeed: 2000 + rand() * 4000,
    });
  }

  return stars;
}
