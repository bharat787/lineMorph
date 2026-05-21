import {
  ROOFTOP_GAP_MARGIN,
  SKYLINE_BUILDINGS,
} from './skylineLayout'
import './SkylineRooftops.css'

type Props = {
  groundY: number
}

type Gap = {
  x1: number
  x2: number
  /** Roof height(s) in px above ground; one = flat roof, many = steps */
  heights: number[]
}

/** Rectilinear block: vertical sides, horizontal roof, right angles only. */
function rectilinearPath(
  x1: number,
  x2: number,
  groundY: number,
  heights: number[],
): string {
  if (x2 <= x1 + 4) return ''

  if (heights.length === 1) {
    const roofY = groundY - heights[0]
    return `M ${x1} ${groundY} L ${x1} ${roofY} L ${x2} ${roofY} L ${x2} ${groundY}`
  }

  const step = (x2 - x1) / heights.length
  let d = `M ${x1} ${groundY} L ${x1} ${groundY - heights[0]}`
  heights.forEach((h, i) => {
    const x = x1 + step * (i + 1)
    d += ` L ${x} ${groundY - h}`
  })
  d += ` L ${x2} ${groundY}`
  return d
}

function buildGaps(): Gap[] {
  const m = ROOFTOP_GAP_MARGIN
  const { pfa, salesforce: sf, pyramid, ferry } = SKYLINE_BUILDINGS

  return [
    {
      x1: 0,
      x2: pfa.centerX - pfa.halfWidth - m,
      heights: [48],
    },
    {
      x1: pfa.centerX + pfa.halfWidth + m,
      x2: sf.centerX - sf.halfWidth - m,
      heights: [56],
    },
    {
      x1: sf.centerX + sf.halfWidth + m,
      x2: pyramid.centerX - pyramid.halfWidth - m,
      heights: [70, 76, 68],
    },
    {
      x1: pyramid.centerX + pyramid.halfWidth + m,
      x2: ferry.centerX - ferry.halfWidth - m,
      heights: [58, 62],
    },
  ].filter((gap) => gap.x2 > gap.x1 + 4)
}

/**
 * Rectilinear rooftop fillers between landmarks (no overlap with main buildings).
 */
export function SkylineRooftops({ groundY }: Props) {
  const gaps = buildGaps()

  return (
    <g className="skyline-rooftops">
      {gaps.map((gap, i) => {
        const d = rectilinearPath(gap.x1, gap.x2, groundY, gap.heights)
        if (!d) return null
        return (
          <path
            key={i}
            className="skyline-rooftops__block skyline-stroke skyline-stroke--buildings"
            d={d}
            fill="none"
          />
        )
      })}
    </g>
  )
}
