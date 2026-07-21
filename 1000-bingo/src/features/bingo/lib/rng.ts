export interface Rng {
  next: () => number
}

function xmur3(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }

  return function hash() {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return h >>> 0
  }
}

function sfc32(a: number, b: number, c: number, d: number): () => number {
  return function nextValue() {
    a >>>= 0
    b >>>= 0
    c >>>= 0
    d >>>= 0

    const t = (a + b) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    d = (d + 1) | 0

    const next = (t + d) | 0
    c = (c + next) | 0

    return (next >>> 0) / 4294967296
  }
}

export function createSeededRng(seedInput: string): Rng {
  const seed = seedInput.trim() || 'bingo-default-seed'
  const seedFactory = xmur3(seed)
  const nextValue = sfc32(seedFactory(), seedFactory(), seedFactory(), seedFactory())

  return {
    next: () => nextValue(),
  }
}
