import './SuspensionBridge.css'

const VIEW_WIDTH = 1400
const VIEW_HEIGHT = 380

/** Side-view suspension bridge: main cable, two pillars, deck (4 strokes). */
export function SuspensionBridge() {
  const deckY = 248
  const towerTopY = 72
  const towerCapExtension = 22
  const towerBaseExtension = 100
  const towerPillarTopY = towerTopY - towerCapExtension
  const towerPillarBottomY = deckY + towerBaseExtension
  const leftTowerX = VIEW_WIDTH * 0.22
  const rightTowerX = VIEW_WIDTH * 0.78
  const deckLeftX = VIEW_WIDTH * 0.04
  const deckRightX = VIEW_WIDTH * 0.96
  const cableSagY = 289
  const cableSagX = VIEW_WIDTH / 2
  // Anchors near the deck; side spans curve up over each tower
  const cableAnchorY = deckY - 2
  const cableLeftX = VIEW_WIDTH * 0.012
  const cableRightX = VIEW_WIDTH * 0.988

  const sideSagDepth = 42
  const leftSideSagX = (cableLeftX + leftTowerX) / 2
  const leftSideSagY = (cableAnchorY + towerTopY) / 2 + sideSagDepth
  const rightSideSagX = (rightTowerX + cableRightX) / 2
  const rightSideSagY = (cableAnchorY + towerTopY) / 2 + sideSagDepth

  const cablePath = [
    `M ${cableLeftX} ${cableAnchorY}`,
    `Q ${leftSideSagX} ${leftSideSagY} ${leftTowerX} ${towerTopY}`,
    `Q ${cableSagX} ${cableSagY} ${rightTowerX} ${towerTopY}`,
    `Q ${rightSideSagX} ${rightSideSagY} ${cableRightX} ${cableAnchorY}`,
  ].join(' ')

  return (
    <svg
      className="suspension-bridge"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Side view of a suspension bridge"
    >
      {/* Main suspension cable — approach spans + catenary over the deck */}
      <path
        className="bridge-stroke bridge-stroke--cable"
        d={cablePath}
        fill="none"
      />

      {/* Left tower — slight extension above saddle and below deck */}
      <line
        className="bridge-stroke bridge-stroke--pillar"
        x1={leftTowerX}
        y1={towerPillarTopY}
        x2={leftTowerX}
        y2={towerPillarBottomY}
      />

      {/* Right tower */}
      <line
        className="bridge-stroke bridge-stroke--pillar"
        x1={rightTowerX}
        y1={towerPillarTopY}
        x2={rightTowerX}
        y2={towerPillarBottomY}
      />

      {/* Bridge deck */}
      <line
        className="bridge-stroke bridge-stroke--deck"
        x1={deckLeftX}
        y1={deckY}
        x2={deckRightX}
        y2={deckY}
      />
    </svg>
  )
}
