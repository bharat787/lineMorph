/** Classic 4×4 Bayer matrix (0–15). */
export const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const

const BAYER_MAX = 15

/** Returns true when this screen cell should be “on” at the given threshold (0–1). */
export function bayerPasses(
  x: number,
  y: number,
  threshold: number,
  cellSize: number,
): boolean {
  if (threshold <= 0) return false
  if (threshold >= 1) return true

  const bx = Math.floor(x / cellSize) % 4
  const by = Math.floor(y / cellSize) % 4
  const level = BAYER_4X4[by][bx] / BAYER_MAX
  return level < threshold
}
