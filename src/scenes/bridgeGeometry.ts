/** Bridge layout for the scroll transition scene. */
export const BRIDGE_VIEW = { width: 1400, height: 380 } as const

const deckY = 248
/** Second deck line — full span, parallel just below the main deck. */
const lowerDeckY = deckY + 8
/** Single continuous deck arch — center highest, ends lower (Earth-like camber). */
const deckCrown = 15
const deckEndDrop = 2
const towerTopY = 72
const towerCapExtension = 22
const towerBaseExtension = 100
/** Shared bounds for tower verticals. */
const verticalTopY = towerTopY - towerCapExtension
const verticalBottomY = deckY + towerBaseExtension
const leftTowerX = BRIDGE_VIEW.width * 0.22
const rightTowerX = BRIDGE_VIEW.width * 0.78
const deckLeftX = 0
const deckRightX = BRIDGE_VIEW.width
const cableSagY = 289
const cableSagX = BRIDGE_VIEW.width / 2
const cableAnchorY = deckY + deckEndDrop
const cableLeftX = 0
const cableRightX = BRIDGE_VIEW.width
const sideSagDepth = 42
const leftSideSagX = (cableLeftX + leftTowerX) / 2
const leftSideSagY = (cableAnchorY + towerTopY) / 2 + sideSagDepth
const rightSideSagX = (rightTowerX + cableRightX) / 2
const rightSideSagY = (cableAnchorY + towerTopY) / 2 + sideSagDepth

/** Slim tower width — two vertical edges centered on each tower. */
const towerHalfWidth = 2
const leftTowerOuterX = leftTowerX - towerHalfWidth
const leftTowerInnerX = leftTowerX + towerHalfWidth
const rightTowerOuterX = rightTowerX - towerHalfWidth
const rightTowerInnerX = rightTowerX + towerHalfWidth

/** Deck truss — full span between upper and lower deck chords. */
const trussLeftX = deckLeftX
const trussRightX = deckRightX
const trussPanelWidth = 42
/** Nudge zigzag phase left so end panels look balanced (px). */
const trussPhaseShiftLeft = 10

function towerRect(outerX: number, innerX: number): string {
  return [
    `M ${outerX} ${verticalTopY}`,
    `L ${innerX} ${verticalTopY}`,
    `L ${innerX} ${verticalBottomY}`,
    `L ${outerX} ${verticalBottomY}`,
    'Z',
  ].join(' ')
}

function verticalLine(x: number): string {
  return `M ${x} ${verticalTopY} L ${x} ${verticalBottomY}`
}

const deckHalfSpan = (deckRightX - deckLeftX) / 2
const deckCenterX = deckLeftX + deckHalfSpan

/** Y on the shared parabolic deck arch at x (same profile for upper + lower chords). */
function deckElevationAt(x: number, baseY: number): number {
  const clampedX = Math.max(deckLeftX, Math.min(deckRightX, x))
  const t = (clampedX - deckCenterX) / deckHalfSpan
  return baseY - deckCrown + (deckEndDrop + deckCrown) * t * t
}

function deckCurvePath(baseY: number): string {
  const samples = 48
  const parts: string[] = []
  for (let i = 0; i <= samples; i++) {
    const x = deckLeftX + (i / samples) * (deckRightX - deckLeftX)
    const y = deckElevationAt(x, baseY)
    parts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
  }
  return parts.join(' ')
}

/** Warren truss between curved deck chords (upper + lower). */
function deckTrussPath(): string {
  const span = trussRightX - trussLeftX
  const remainder = span % trussPanelWidth
  const phaseStart =
    trussLeftX + Math.max(0, remainder / 2 - trussPhaseShiftLeft)

  const topAt = (x: number) => deckElevationAt(x, deckY)
  const bottomAt = (x: number) => deckElevationAt(x, lowerDeckY)

  const parts = [
    `M ${trussLeftX} ${topAt(trussLeftX)}`,
    `L ${trussLeftX} ${bottomAt(trussLeftX)}`,
  ]
  let x = phaseStart
  if (x > trussLeftX) {
    parts.push(`L ${x} ${topAt(x)}`)
  }
  // At the left edge we're on the bottom chord — first step goes up to top.
  let onTop = x <= trussLeftX

  while (x < trussRightX) {
    x = Math.min(x + trussPanelWidth, trussRightX)
    parts.push(`L ${x} ${onTop ? topAt(x) : bottomAt(x)}`)
    onTop = !onTop
  }

  parts.push(`L ${trussRightX} ${topAt(trussRightX)}`)
  return parts.join(' ')
}

const BRIDGE_TOWER_FILLS = {
  left: towerRect(leftTowerOuterX, leftTowerInnerX),
  right: towerRect(rightTowerOuterX, rightTowerInnerX),
} as const

/** Full main cable — left span, center span, and right span as one path. */
const topCablePath = [
  `M ${cableLeftX} ${cableAnchorY}`,
  `Q ${leftSideSagX} ${leftSideSagY} ${leftTowerX} ${towerTopY}`,
  `Q ${cableSagX} ${cableSagY} ${rightTowerX} ${towerTopY}`,
  `Q ${rightSideSagX} ${rightSideSagY} ${cableRightX} ${cableAnchorY}`,
].join(' ')

/** Bridge strokes rendered and animated in TransitionScene. */
export const BRIDGE_PATHS = {
  deck: deckCurvePath(deckY),
  lowerTruss: deckCurvePath(lowerDeckY),
  leftPillar: BRIDGE_TOWER_FILLS.left,
  topCable: topCablePath,
  leftSuspender: verticalLine(leftTowerOuterX),
  centerSuspender: deckTrussPath(),
  rightPillar: BRIDGE_TOWER_FILLS.right,
  rightSuspender: verticalLine(rightTowerInnerX),
} as const

export type BridgeStrokeId = keyof typeof BRIDGE_PATHS

export const BRIDGE_TOWER_STROKE_IDS = ['leftPillar', 'rightPillar'] as const

export type StreetLight = {
  x: number
  baseY: number
  headY: number
}

const streetLightSpacing = 72

/** Lamp posts along the deck — visible in dark mode at full bridge. */
export const STREET_LIGHTS: StreetLight[] = Array.from(
  { length: Math.floor(BRIDGE_VIEW.width / streetLightSpacing) - 1 },
  (_, i) => {
    const x = streetLightSpacing * (i + 1)
    const deckAtX = deckElevationAt(x, deckY)
    return {
      x,
      baseY: deckAtX + 2,
      headY: deckAtX - 14,
    }
  },
)
