import { BRIDGE_VIEW } from './bridgeGeometry'
import {
  FERRY_OUTLINE, FERRY_CLOCK, FERRY_DETAILS, FERRY_FLAG,
  PALACE_OUTLINE, PALACE_DETAILS, TRANSAMERICA_DETAILS,
  COIT_OUTLINE, COIT_DETAILS, SALESFORCE_OUTLINE, SALESFORCE_DETAILS,
} from './skylineLandmarks'

export const SKYLINE_GROUND_Y = 274
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

// Keep the landmark spacing; fill the intervening spaces with modest city blocks.
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

// Fixed variations feel irregular without changing during scroll or resize.
const blockHeights = [
  [32, 61, 43], [48, 83, 36], [39, 69, 47],
  [54, 34, 66], [42, 88, 58], [57, 36, 24],
]
const cityBlocks = blockHeights.flatMap((heights, gapIndex) => {
  const left = gapIndex === 0 ? 0 : SKYLINE_LAYOUT[gapIndex - 1].placedLeft + SKYLINE_LAYOUT[gapIndex - 1].width
  const right = gapIndex === SKYLINE_LAYOUT.length ? BRIDGE_VIEW.width : SKYLINE_LAYOUT[gapIndex].placedLeft
  const start = left + 8
  const available = right - left - 16
  const weights = gapIndex % 2 === 0 ? [0.34, 0.39, 0.27] : [0.29, 0.33, 0.38]
  let x = start
  return heights.map((height, index) => {
    const width = available * weights[index]
    const building = { left: x, right: x + width, top: SKYLINE_GROUND_Y - height, stepped: (gapIndex + index) % 3 === 1 }
    x += width
    return building
  })
})

function blockOutline(block: typeof cityBlocks[number]): string {
  const { left, right, top, stepped } = block
  const roof = stepped
    ? `L${right} ${top + 8} L${right - 5} ${top + 8} L${right - 5} ${top} L${left + 5} ${top} L${left + 5} ${top + 8} L${left} ${top + 8}`
    : `L${right} ${top} L${left} ${top}`
  return `L${right} ${SKYLINE_GROUND_Y} ${roof} L${left} ${SKYLINE_GROUND_Y}`
}

/** One continuous outline through the landmarks and simpler neighboring blocks. */
export const SKYLINE_MORPH_TARGET = [
  `M${BRIDGE_VIEW.width} ${SKYLINE_GROUND_Y}`,
  ...[
    ...SKYLINE_LAYOUT.map(item => ({ left: item.placedLeft, path: transformPath(item.outline, item).replace(/^M/, 'L') })),
    ...cityBlocks.map(block => ({ left: block.left, path: blockOutline(block) })),
  ].sort((a, b) => b.left - a.left).map(item => item.path),
  `L0 ${SKYLINE_GROUND_Y}`,
].join(' ')

// Sparse cornices and short window slits keep the landmarks visually dominant.
const CITY_BLOCK_DETAILS = cityBlocks.map(({ left, right, top }, index) => {
  const paths = [`M${left + 4} ${top + 13} L${right - 4} ${top + 13}`]
  if (index % 2 === 0) {
    for (const x of [left + (right - left) / 3, left + (right - left) * 2 / 3]) {
      paths.push(`M${x} ${top + 20} L${x} ${Math.min(top + 28, SKYLINE_GROUND_Y - 5)}`)
    }
  }
  return paths.join(' ')
})

/** Each landmark's interior shares its outline's placement and reveal timing. */
export const SKYLINE_REVEAL_PATHS = [...SKYLINE_LAYOUT.flatMap(item => [
  transformPath(item.details.join(' '), item),
  ...(item.id === 'ferry' ? clockDetails(item) : []),
]), ...CITY_BLOCK_DETAILS]
