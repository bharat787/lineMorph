/** Bridge layout for the scroll transition scene. */
export const BRIDGE_VIEW = { width: 1400, height: 380 } as const

const deckY = 248
/** Second deck line — full span, parallel just below the main deck. */
const lowerDeckY = deckY + 8
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
const cableAnchorY = deckY - 2
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

/** Warren truss between deck chords (upper + lower horizontal lines). */
function deckTrussPath(): string {
  const topY = deckY
  const bottomY = lowerDeckY
  const span = trussRightX - trussLeftX
  const remainder = span % trussPanelWidth
  const phaseStart =
    trussLeftX + Math.max(0, remainder / 2 - trussPhaseShiftLeft)

  const parts = [`M ${trussLeftX} ${topY}`, `L ${trussLeftX} ${bottomY}`]
  let x = phaseStart
  if (x > trussLeftX) {
    parts.push(`L ${x} ${topY}`)
  }
  let onTop = false

  while (x < trussRightX) {
    x = Math.min(x + trussPanelWidth, trussRightX)
    parts.push(`L ${x} ${onTop ? topY : bottomY}`)
    onTop = !onTop
  }

  parts.push(`L ${trussRightX} ${topY}`)
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
  deck: `M ${deckLeftX} ${deckY} L ${deckRightX} ${deckY}`,
  lowerTruss: `M ${deckLeftX} ${lowerDeckY} L ${deckRightX} ${lowerDeckY}`,
  leftPillar: BRIDGE_TOWER_FILLS.left,
  topCable: topCablePath,
  leftSuspender: verticalLine(leftTowerOuterX),
  centerSuspender: deckTrussPath(),
  rightPillar: BRIDGE_TOWER_FILLS.right,
  rightSuspender: verticalLine(rightTowerInnerX),
} as const

export type BridgeStrokeId = keyof typeof BRIDGE_PATHS

export const BRIDGE_TOWER_STROKE_IDS = ['leftPillar', 'rightPillar'] as const
