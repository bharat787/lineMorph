import { SKYLINE_BUILDINGS } from './skylineLayout'
import { PFABuilding } from './PFABuilding'
import { SkylineRooftops } from './SkylineRooftops'
import { SalesforceTower } from './SalesforceTower'
import { FerryBuilding } from './FerryBuilding'
import { TransamericaPyramid } from './TransamericaPyramid'
import './CitySkyline.css'

const VIEW_WIDTH = 1400
const VIEW_MAX_Y = 400
const VIEW_MIN_Y = -64

/**
 * Simplified SF waterfront skyline (stroke silhouettes).
 * Inspired by reference: Salesforce, Pyramid, Ferry Building, Coit-ish tower.
 */
export function CitySkyline() {
  const groundY = 218

  const { pfa, salesforce, pyramid, ferry } = SKYLINE_BUILDINGS

  return (
    <svg
      className="city-skyline"
      viewBox={`0 ${VIEW_MIN_Y} ${VIEW_WIDTH} ${VIEW_MAX_Y - VIEW_MIN_Y}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="San Francisco skyline from the waterfront"
    >
      <g className="skyline-stroke skyline-stroke--buildings">
        <SkylineRooftops groundY={groundY} />

        <PFABuilding centerX={pfa.centerX} groundY={groundY} />
        <SalesforceTower centerX={salesforce.centerX} groundY={groundY} />
        <TransamericaPyramid centerX={pyramid.centerX} groundY={groundY} />
        <FerryBuilding centerX={ferry.centerX} groundY={groundY} />
      </g>
    </svg>
  )
}
