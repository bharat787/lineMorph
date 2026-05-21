import type { BridgeStrokeId } from './bridgeGeometry'

/** Top suspension cable morphs into the skyline outline. */
export const SKYLINE_MORPH_STROKE: BridgeStrokeId = 'centerCable'

/** All other bridge strokes fade out during the morph. */
export const BRIDGE_FADE_STROKES: BridgeStrokeId[] = [
  'deck',
  'lowerTruss',
  'leftPillar',
  'leftCable',
  'leftSuspender',
  'centerSuspender',
  'rightCable',
  'rightPillar',
  'rightSuspender',
]

/** SVG paint order (truss between deck lines, cables on top). */
export const BRIDGE_RENDER_ORDER: BridgeStrokeId[] = [
  'deck',
  'lowerTruss',
  'centerSuspender',
  'leftCable',
  'centerCable',
  'rightCable',
  'leftPillar',
  'rightPillar',
  'leftSuspender',
  'rightSuspender',
]

export const MORPH_SEGMENT_LENGTH = 8

export const SCROLL_END = '+=340%'

/** Timeline segment lengths (sum ≈ 1). */
export const MORPH_TIMING = {
  fadeStart: 0.08,
  fadeDuration: 0.22,
  morphStart: 0.12,
  morphDuration: 0.52,
  detailFadeStart: 0.72,
  detailFadeDuration: 0.16,
  detailDrawStart: 0.74,
  detailDrawDuration: 0.22,
  detailStagger: 0.04,
} as const
