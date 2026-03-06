const hash32 = (value: string, seed: number): number => {
  let h = seed >>> 0
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

export class CountMinSketch {
  readonly d: number
  readonly w: number
  private table: number[][]
  private seed: number

  constructor(d: number, w: number, seed = 1) {
    if (d <= 0 || w <= 0) throw new Error("invalid dimensions")
    this.d = d
    this.w = w
    this.seed = seed >>> 0
    this.table = Array.from({ length: d }, () => Array.from({ length: w }, () => 0))
  }

  update(key: string, count = 1): void {
    if (count <= 0) return
    for (let i = 0; i < this.d; i += 1) {
      const idx = hash32(key, this.seed + i * 0x9e3779b9) % this.w
      this.table[i][idx] += count
    }
  }

  estimate(key: string): number {
    let min = Number.POSITIVE_INFINITY
    for (let i = 0; i < this.d; i += 1) {
      const idx = hash32(key, this.seed + i * 0x9e3779b9) % this.w
      const v = this.table[i][idx]
      if (v < min) min = v
    }
    return min === Number.POSITIVE_INFINITY ? 0 : min
  }
}
