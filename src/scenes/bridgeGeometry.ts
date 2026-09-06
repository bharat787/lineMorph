/** Oblique bridge study: all structure shares one receding projection. */
export const BRIDGE_VIEW = { width: 1400, height: 380 } as const

type Point = [number, number]
const nearTower = 340
const farTower = 1010
const towerHeight = (x: number) => 292 + 58 * Math.max(0, Math.min(1, (x - nearTower) / (farTower - nearTower)))
const scale = (x: number) => 1 - 0.68 * x / BRIDGE_VIEW.width

/** x follows the span; z crosses the roadway; h rises above the deck baseline. */
function project(x: number, h = 0, z = 0): Point {
  const s = scale(x)
  // The foreground side sits to the right, with a lower foot and taller leg.
  const foreground = 1 - z
  return [x + foreground * 58 * s, 318 - x * 0.068 - h * s * (1 + foreground * 0.14) + foreground * 10 * s]
}

/** Extend each projected span exactly to the left viewport edge. */
function spanStart(z = 0): number {
  const offset = (1 - z) * 58
  return -offset / (1 - offset * 0.68 / BRIDGE_VIEW.width)
}

function line(points: Point[], close = false): string {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ') + (close ? ' Z' : '')
}

function beam(x: number, h: number, width: number, height: number): string {
  return line([project(x, h, 0), project(x, h, width), project(x, h + height, width), project(x, h + height, 0)], true)
}

function tower(x: number): string {
  const parts: string[] = []
  const height = towerHeight(x)
  // Two portal legs, tapered crown, and three open crossbeam bays.
  for (const z of [1, 0]) {
    parts.push(line([
      project(x - 7, -67, z), project(x - 7, height - 9, z),
      project(x - 4, height - 9, z), project(x - 4, height, z), project(x, height, z),
      project(x + 4, height, z), project(x + 4, height - 9, z),
      project(x + 7, height - 9, z), project(x + 7, -67, z),
    ], true))
    parts.push(line([project(x + 1, -67, z), project(x + 1, height - 9, z)]))
  }
  for (const h of [65, 139, 211, 276]) parts.push(beam(x, h * height / 292, 1, 9))
  return parts.join(' ')
}

/** Parabolic suspension spans, continuous at the tower saddles. */
function cableHeight(x: number): number {
  if (x < nearTower) {
    const t = Math.max(0, x / nearTower)
    return 5 + (towerHeight(nearTower) - 5) * t * t
  }
  if (x > farTower) {
    const t = (1400 - x) / (1400 - farTower)
    return 5 + (towerHeight(farTower) - 5) * t * t
  }
  const t = (x - nearTower) / (farTower - nearTower)
  return towerHeight(x) - 4 * 215 * t * (1 - t)
}

/** Shared attachment stations make every hanger endpoint a cable vertex. */
const hangerStations = Array.from({ length: 39 }, (_, i) => {
  const t = (i + 1) / 40
  return 1400 * 1.9 * t / (1 + 0.9 * t)
}).filter(x => Math.abs(x - nearTower) >= 12 && Math.abs(x - farTower) >= 12)

function cable(z: number): string {
  const xs = [...new Set([
    spanStart(z), 0, nearTower, farTower, 1400,
    ...hangerStations,
    ...Array.from({ length: 281 }, (_, i) => i * 5),
  ])].sort((a, b) => a - b)
  return line(xs.map(x => project(x, cableHeight(x), z)))
}

/** One broad arc across both approaches and the main span.
 * Compensate for depth so the distant approach retains visible curvature.
 */
function deckHeight(x: number): number {
  const start = spanStart()
  const t = Math.max(0, Math.min(1, (x - start) / (BRIDGE_VIEW.width - start)))
  return 18 * 4 * t * (1 - t) / scale(x)
}

const trussStations = Array.from({ length: 101 }, (_, i) => {
  const t = i / 100
  return 1400 * 1.9 * t / (1 + 0.9 * t)
})

function deckPoint(x: number, offset = 0, z = 0): Point {
  return project(x, deckHeight(x) + offset, z)
}

function deckPath(offset = 0, z = 0): string {
  const xs = [...new Set([
    spanStart(z), ...trussStations, ...hangerStations,
    ...Array.from({ length: 281 }, (_, i) => i * 5),
  ])].sort((a, b) => a - b)
  return line(xs.map(x => deckPoint(x, offset, z)))
}

function hangers(z: number): string {
  return hangerStations.map(x =>
    line([deckPoint(x, 0, z), project(x, cableHeight(x), z)]),
  ).join(' ')
}

function truss(): string {
  const points: Point[] = [deckPoint(spanStart(), -3)]
  trussStations.forEach((x, i) => {
    points.push(deckPoint(x, i % 2 ? -15 : -3))
  })
  return line(points)
}

export const BRIDGE_PATHS = {
  backCable: cable(1),
  backHangers: hangers(1),
  backDeck: deckPath(0, 1),
  roadway: deckPath(0, 0.48),
  deck: deckPath(),
  lowerTruss: deckPath(-3) + ' ' + deckPath(-15),
  truss: truss(),
  hangers: hangers(0),
  farTower: tower(farTower),
  nearTower: tower(nearTower),
  topCable: cable(0),
} as const

export type BridgeStrokeId = keyof typeof BRIDGE_PATHS
