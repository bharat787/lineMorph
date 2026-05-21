import {
  BRIDGE_PATHS,
  BRIDGE_TOWER_STROKE_IDS,
  BRIDGE_VIEW,
} from '../scenes/bridgeGeometry'
import { BRIDGE_RENDER_ORDER } from '../scenes/morphPlan'
import './SuspensionBridge.css'

const TOWER_FILL_IDS = new Set<string>(BRIDGE_TOWER_STROKE_IDS)
const TOWER_EDGE_IDS = new Set(['leftSuspender', 'rightSuspender'])

/** Side-view suspension bridge — ten strokes (matches TransitionScene). */
export function SuspensionBridge() {
  return (
    <svg
      className="suspension-bridge"
      viewBox={`0 0 ${BRIDGE_VIEW.width} ${BRIDGE_VIEW.height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Side view of a suspension bridge"
    >
      {BRIDGE_RENDER_ORDER.map((id) => (
        <path
          key={id}
          className={`bridge-stroke bridge-stroke--${id}${
            TOWER_FILL_IDS.has(id) ? ' bridge-stroke--tower-fill' : ''
          }${TOWER_EDGE_IDS.has(id) ? ' bridge-stroke--tower-edge' : ''}`}
          d={BRIDGE_PATHS[id]}
        />
      ))}
    </svg>
  )
}
