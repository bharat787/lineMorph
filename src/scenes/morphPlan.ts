import type { BridgeStrokeId } from './bridgeGeometry'
import { MORPH_PAIRS } from './skylineTargets'

/** Scroll choreography: west → center → east, deck anchors first. */
export const MORPH_STROKE_ORDER: BridgeStrokeId[] = [
  'deck',
  'leftCable',
  'leftPillar',
  'leftSuspender',
  'centerSuspender',
  'centerCable',
  'rightPillar',
  'lowerTruss',
  'rightCable',
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

export const MORPH_SEGMENT_LENGTH = 6

export const SCROLL_END = '+=340%'

/** Timeline segment lengths (sum ≈ 1). */
export const MORPH_TIMING = {
  stagger: 0.028,
  morphDuration: 0.42,
  morphStart: 0.02,
  revealFadeStart: 0.68,
  revealFadeDuration: 0.18,
  revealDrawStart: 0.7,
  revealDrawDuration: 0.26,
  revealStagger: 0.018,
} as const

export function getMorphTargetId(strokeId: BridgeStrokeId) {
  return MORPH_PAIRS[strokeId]
}

/** Timeline position when a stroke’s morph begins. */
export function morphTimeFor(strokeId: BridgeStrokeId): number {
  const i = MORPH_STROKE_ORDER.indexOf(strokeId)
  return MORPH_TIMING.morphStart + i * MORPH_TIMING.stagger
}
