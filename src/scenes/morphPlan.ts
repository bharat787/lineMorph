import type { BridgeStrokeId } from './bridgeGeometry'

/** Full top suspension cable morphs into the skyline outline. */
export const SKYLINE_MORPH_STROKE: BridgeStrokeId = 'topCable'

/** All other bridge strokes fade out before the morph. */
export const BRIDGE_FADE_STROKES: BridgeStrokeId[] = [
  'deck',
  'lowerTruss',
  'leftPillar',
  'leftSuspender',
  'centerSuspender',
  'rightPillar',
  'rightSuspender',
]

/** SVG paint order (truss between deck lines, cable on top). */
export const BRIDGE_RENDER_ORDER: BridgeStrokeId[] = [
  'deck',
  'lowerTruss',
  'centerSuspender',
  'topCable',
  'leftPillar',
  'rightPillar',
  'leftSuspender',
  'rightSuspender',
]

/** Finer steps keep the morphed skyline ridge close to the traced outline. */
export const MORPH_SEGMENT_LENGTH = 4

export const SCROLL_END = '+=340%'

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
