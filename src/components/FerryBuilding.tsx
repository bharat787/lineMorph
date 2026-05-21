import ferryPaths from '../assets/ferry-building-paths.json'
import './FerryBuilding.css'

type Props = {
  centerX: number
  groundY: number
}

/** Traced SVG bounds (viewBox 0 0 1536 1024). */
const SVG_CENTER_X = 765
const SVG_BASE_Y = 883
const SVG_WIDTH = 1400

/** Scale to match prior ferry footprint width in the skyline (~340px). */
const TARGET_WIDTH = 340

/**
 * Ferry Building from traced SVG (`src/assets/ferry-building.svg`).
 */
export function FerryBuilding({ centerX, groundY }: Props) {
  const scale = TARGET_WIDTH / SVG_WIDTH

  const transform = `translate(${centerX} ${groundY}) scale(${scale}) translate(${-SVG_CENTER_X} ${-SVG_BASE_Y})`

  return (
    <g
      className="ferry-building skyline-stroke skyline-stroke--buildings"
      transform={transform}
    >
      {ferryPaths.map((d, i) => (
        <path key={i} className="ferry-building__path" d={d} />
      ))}
    </g>
  )
}
