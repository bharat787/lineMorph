import type { BridgeStrokeId } from './bridgeGeometry'

/** Full top suspension cable morphs into the skyline outline. */
export const SKYLINE_MORPH_STROKE: BridgeStrokeId = 'topCable'

/** Deck + truss fade out before the morph. */
export const BRIDGE_FADE_STROKES: BridgeStrokeId[] = [
  'deck',
  'lowerTruss',
  'centerSuspender',
]

/** Towers and their hanger lines — same fade band as the pillar style morph. */
export const BRIDGE_TOWER_FADE_STROKES: BridgeStrokeId[] = [
  'leftPillar',
  'rightPillar',
  'deckSuspenders',
  'leftSuspender',
  'rightSuspender',
]

/** SVG paint order (truss between deck lines, cable on top). */
export const BRIDGE_RENDER_ORDER: BridgeStrokeId[] = [
  'deck',
  'lowerTruss',
  'centerSuspender',
  'deckSuspenders',
  'topCable',
  'leftPillar',
  'rightPillar',
  'leftSuspender',
  'rightSuspender',
]

/** Finer steps keep the morphed skyline ridge close to the traced outline. */
export const MORPH_SEGMENT_LENGTH = 4

export const SCROLL_END = '+=340%'

/** Scroll progress bands where the scene is fully bridge or fully skyline. */
export const STABLE_PROGRESS = {
  bridgeMax: 0.05,
  skylineMin: 0.94,
} as const

/** Timeline segment lengths (sum ≈ 1). */
export const MORPH_TIMING = {
  fadeStart: 0.08,
  fadeDuration: 0.22,
  /** After fade completes — deck and truss gone before skyline morph. */
  morphStart: 0.32,
  morphDuration: 0.52,
  detailFadeStart: 0.86,
  detailFadeDuration: 0.16,
  detailDrawStart: 0.88,
  detailDrawDuration: 0.22,
  detailStagger: 0.04,
} as const

/** Denser samples + smaller Bayer cells = more dots along the morph. */
export const STIPPLE_SAMPLE_LENGTH = 2

export const STIPPLE_CELL_SIZE = 3
export const STIPPLE_DOT_RADIUS = 1.1

/** Ordered-dither stipple only during the cable → skyline morph. */
export const DITHER_TIMING = {
  /** When morph begins: crossfade solid cable → stipple. */
  stippleInStart: 0.32,
  stippleInDuration: 0.04,
  thresholdStart: 0.42,
  thresholdEnd: 0.98,
  /** Crossfade stipple → crisp SVG stroke at end of morph. */
  crispStart: 0.8,
  crispDuration: 0.14,
} as const
