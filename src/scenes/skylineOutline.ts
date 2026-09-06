import { BRIDGE_VIEW } from './bridgeGeometry'
import {
  FERRY_OUTLINE, FERRY_CLOCK, FERRY_DETAILS, FERRY_FLAG,
  PALACE_OUTLINE, PALACE_DETAILS, TRANSAMERICA_DETAILS,
  COIT_OUTLINE, COIT_DETAILS, SALESFORCE_OUTLINE, SALESFORCE_DETAILS,
} from './skylineLandmarks'

export const SKYLINE_GROUND_Y = 238
// Retain the established landmark proportions from the original source tracing.
const SCALE_X = 1400 / (1745.15918 - 31.499998)
const SCALE_Y = 236 / (691.5 - 179.569)

type Landmark = {
  id: string
  left: number
  right: number
  ground: number
  outline: string
  details: string[]
}

const landmarks: Landmark[] = [
  {
    id: 'transamerica', left: 301, right: 421, ground: 687,
    outline: 'M421 687 L385 435 L385 330 L373 330 L361 237.5 L349 330 L337 330 L337 435 L301 687',
    details: TRANSAMERICA_DETAILS,
  },
  {
    id: 'ferry', left: 526, right: 860, ground: 682,
    // Remove the old connector into the neighboring generic building.
    outline: FERRY_OUTLINE.replace(/^L/, 'M').split(' L487')[0],
    details: [FERRY_FLAG, ...FERRY_DETAILS],
  },
  {
    id: 'coit', left: 900.75, right: 980.75, ground: 682,
    outline: COIT_OUTLINE.replace(/^L/, 'M'), details: COIT_DETAILS,
  },
  {
    id: 'palace', left: 1021.5, right: 1214, ground: 682,
    outline: PALACE_OUTLINE.replace(/^L/, 'M'), details: PALACE_DETAILS,
  },
  {
    id: 'salesforce', left: 1442.290894, right: 1533, ground: 691,
    outline: SALESFORCE_OUTLINE, details: SALESFORCE_DETAILS,
  },
]

// Equal clear space between silhouettes and at both viewport edges.
const totalWidth = landmarks.reduce((sum, item) => sum + (item.right - item.left) * SCALE_X, 0)
const gap = (BRIDGE_VIEW.width - totalWidth) / (landmarks.length + 1)
let cursor = gap
export const SKYLINE_LAYOUT = landmarks.map(item => {
  const left = cursor
  const width = (item.right - item.left) * SCALE_X
  cursor += width + gap
  return { ...item, placedLeft: left, width }
})

type PlacedLandmark = typeof SKYLINE_LAYOUT[number]

/** Source paths use absolute M/L/C/Q commands; map every coordinate pair alike. */
function transformPath(d: string, item: PlacedLandmark): string {
  let isX = true
  return d.replace(/[MLCQZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi, token => {
    if (/^[MLCQZ]$/i.test(token)) {
      isX = true
      return token
    }
    const value = Number(token)
    const result = isX
      ? item.placedLeft + (value - item.left) * SCALE_X
      : SKYLINE_GROUND_Y + (value - item.ground) * SCALE_Y
    isX = !isX
    return result.toFixed(3)
  })
}

function clockDetails(item: PlacedLandmark): string[] {
  const x = item.placedLeft + (FERRY_CLOCK.x - item.left) * SCALE_X
  const y = SKYLINE_GROUND_Y + (FERRY_CLOCK.y - item.ground) * SCALE_Y
  const r = FERRY_CLOCK.radius
  const circle = `M${x - r} ${y} A${r} ${r} 0 1 0 ${x + r} ${y} A${r} ${r} 0 1 0 ${x - r} ${y}`
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = i * Math.PI / 6
    return `M${x + Math.sin(a) * (r - 2)} ${y + Math.cos(a) * (r - 2)} L${x + Math.sin(a) * (r - 3.5)} ${y + Math.cos(a) * (r - 3.5)}`
  }).join(' ')
  return [circle, ticks + ` M${x - 4} ${y - 4} L${x} ${y} L${x + 5} ${y - 6}`]
}

/** One continuous outline, tracing right-to-left through each landmark and gap. */
export const SKYLINE_MORPH_TARGET = [
  `M${BRIDGE_VIEW.width} ${SKYLINE_GROUND_Y}`,
  ...[...SKYLINE_LAYOUT].reverse().map(item =>
    transformPath(item.outline, item).replace(/^M/, 'L'),
  ),
  `L0 ${SKYLINE_GROUND_Y}`,
].join(' ')

/** Each landmark's interior shares its outline's placement and reveal timing. */
export const SKYLINE_REVEAL_PATHS = SKYLINE_LAYOUT.flatMap(item => [
  transformPath(item.details.join(' '), item),
  ...(item.id === 'ferry' ? clockDetails(item) : []),
])
