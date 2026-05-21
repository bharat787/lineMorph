import { ROOFTOP_GAP_MARGIN, SKYLINE_BUILDINGS } from '../components/skylineLayout'
import { BRIDGE_VIEW } from './bridgeGeometry'

/** Matches CitySkyline groundY — deck morphs down onto this line. */
const g = 218
const w = BRIDGE_VIEW.width
const { pfa, salesforce: sf, pyramid, ferry } = SKYLINE_BUILDINGS
const m = ROOFTOP_GAP_MARGIN

const pfaL = pfa.centerX - pfa.halfWidth
const pfaR = pfa.centerX + pfa.halfWidth
const ferryL = ferry.centerX - ferry.halfWidth
const ferryR = ferry.centerX + ferry.halfWidth

/**
 * Simplified hero silhouettes — one path per bridge stroke.
 * Tuned for flubber morph topology (open paths, similar point counts).
 */
export const SKYLINE_TARGETS = {
  deck: `M 0 ${g} L ${w} ${g}`,

  /** Ferry: main facade block */
  lowerTruss: [
    `M ${ferryL} ${g}`,
    `L ${ferryL} ${g - 54}`,
    `L ${ferryR} ${g - 54}`,
    `L ${ferryR} ${g}`,
  ].join(' '),

  /** PFA: rotunda shell with arched crown */
  leftPillar: [
    `M ${pfaL} ${g}`,
    `L ${pfaL} ${g - 72}`,
    `L ${pfa.centerX - 48} ${g - 86}`,
    `Q ${pfa.centerX} ${g - 98} ${pfa.centerX + 48} ${g - 86}`,
    `L ${pfaR} ${g - 72}`,
    `L ${pfaR} ${g}`,
  ].join(' '),

  /** PFA: dome ring */
  leftCable: [
    `M ${pfa.centerX - 88} ${g - 80}`,
    `Q ${pfa.centerX} ${g - 128} ${pfa.centerX + 88} ${g - 80}`,
  ].join(' '),

  /** PFA: left colonnade wing */
  leftSuspender: [
    `M ${pfaL} ${g}`,
    `L ${pfaL} ${g - 46}`,
    `L ${pfa.centerX - 98} ${g - 58}`,
    `L ${pfa.centerX - 98} ${g}`,
  ].join(' '),

  salesforce: [
    `M ${sf.centerX - 28} ${g}`,
    `L ${sf.centerX - 20} ${g - 95}`,
    `Q ${sf.centerX} ${g - 118} ${sf.centerX + 20} ${g - 95}`,
    `L ${sf.centerX + 28} ${g}`,
  ].join(' '),

  /** PFA: right portico / wing */
  centerSuspender: [
    `M ${pfa.centerX + 98} ${g}`,
    `L ${pfa.centerX + 98} ${g - 60}`,
    `L ${pfaR} ${g - 74}`,
    `L ${pfaR} ${g}`,
  ].join(' '),

  /** Ferry: stepped roofline */
  rightCable: [
    `M ${ferryL + 18} ${g - 54}`,
    `L ${ferry.centerX - 36} ${g - 66}`,
    `L ${ferry.centerX + 52} ${g - 62}`,
    `L ${ferryR - 18} ${g - 56}`,
  ].join(' '),

  rightPillar: `M ${pyramid.centerX - 22} ${g} L ${pyramid.centerX} ${g - 176} L ${pyramid.centerX + 22} ${g}`,

  /** Ferry: clock tower + spire */
  rightSuspender: [
    `M ${ferry.centerX - 24} ${g}`,
    `L ${ferry.centerX - 24} ${g - 90}`,
    `L ${ferry.centerX + 24} ${g - 90}`,
    `L ${ferry.centerX + 24} ${g}`,
    `M ${ferry.centerX} ${g - 90}`,
    `L ${ferry.centerX} ${g - 112}`,
    `L ${ferry.centerX + 9} ${g - 124}`,
    `L ${ferry.centerX - 9} ${g - 112}`,
    `L ${ferry.centerX} ${g - 90}`,
  ].join(' '),
} as const

export type MorphStrokeId = keyof typeof SKYLINE_TARGETS

/** Bridge stroke id → skyline target (center cable → salesforce). */
export const MORPH_PAIRS: Record<
  import('./bridgeGeometry').BridgeStrokeId,
  MorphStrokeId
> = {
  deck: 'deck',
  lowerTruss: 'lowerTruss',
  leftPillar: 'leftPillar',
  leftCable: 'leftCable',
  leftSuspender: 'leftSuspender',
  centerCable: 'salesforce',
  centerSuspender: 'centerSuspender',
  rightCable: 'rightCable',
  rightPillar: 'rightPillar',
  rightSuspender: 'rightSuspender',
}

function rectilinearBlock(
  x1: number,
  x2: number,
  heights: number[],
): string {
  if (heights.length === 1) {
    const roofY = g - heights[0]
    return `M ${x1} ${g} L ${x1} ${roofY} L ${x2} ${roofY} L ${x2} ${g}`
  }
  const step = (x2 - x1) / heights.length
  let d = `M ${x1} ${g} L ${x1} ${g - heights[0]}`
  heights.forEach((h, i) => {
    d += ` L ${x1 + step * (i + 1)} ${g - h}`
  })
  d += ` L ${x2} ${g}`
  return d
}

/** Filler rooftops only — heroes morph from bridge strokes. */
export function buildRevealPaths(): string[] {
  return [
    rectilinearBlock(0, pfaL - m, [48]),
    rectilinearBlock(pfaR + m, sf.centerX - sf.halfWidth - m, [56]),
    rectilinearBlock(sf.centerX + sf.halfWidth + m, pyramid.centerX - pyramid.halfWidth - m, [
      70, 76, 68,
    ]),
    rectilinearBlock(pyramid.centerX + pyramid.halfWidth + m, ferryL - m, [58, 62]),
  ].filter((d) => d.length > 0)
}
