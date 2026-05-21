import pfaPaths from '../assets/pfa-paths.json'
import './PFABuilding.css'

type Props = {
  centerX: number
  groundY: number
}

/** Traced SVG bounds (viewBox 0 0 1536 1024). */
const SVG_CENTER_X = 767
const SVG_BASE_Y = 833
const SVG_WIDTH = 1270

/** Scale to fit the left side of the skyline. */
const TARGET_WIDTH = 360

/**
 * SFMOMA / PFA building from traced SVG (`src/assets/pfa.svg`).
 */
export function PFABuilding({ centerX, groundY }: Props) {
  const scale = TARGET_WIDTH / SVG_WIDTH

  const transform = `translate(${centerX} ${groundY}) scale(${scale}) translate(${-SVG_CENTER_X} ${-SVG_BASE_Y})`

  return (
    <g
      className="pfa-building skyline-stroke skyline-stroke--buildings"
      transform={transform}
    >
      {pfaPaths.map((d, i) => (
        <path key={i} className="pfa-building__path" d={d} />
      ))}
    </g>
  )
}
