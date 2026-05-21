import { BRIDGE_VIEW } from './bridgeGeometry'

const SVG_NS = 'http://www.w3.org/2000/svg'

/** Open stroke from sampled points — no closing segment. */
export function openPathFromPoints(points: [number, number][]): string {
  if (points.length === 0) return ''
  const [[x0, y0], ...rest] = points
  let d = `M ${x0} ${y0}`
  for (const [x, y] of rest) d += ` L ${x} ${y}`
  return d
}

function measurePath(d: string): SVGPathElement {
  const path = document.createElementNS(SVG_NS, 'path')
  path.setAttribute('d', d)
  return path
}

function splitSubpaths(d: string): string[] {
  return d
    .trim()
    .split(/(?=M)/i)
    .map((part) => part.trim())
    .filter(Boolean)
}

/** Dense polyline for intersection tests (handles curves via arc-length sampling). */
function densifyPath(d: string, samples = 1000): [number, number][] {
  const path = measurePath(d)
  const length = path.getTotalLength()
  if (length === 0) return []

  const points: [number, number][] = []
  for (let i = 0; i <= samples; i++) {
    const p = path.getPointAtLength((length * i) / samples)
    points.push([p.x, p.y])
  }
  return points
}

function subpathPolylines(d: string): [number, number][][] {
  return splitSubpaths(d).map((part) => densifyPath(part))
}

/** Y values where the polyline crosses vertical line x. */
function yCrossingsAtX(
  polyline: [number, number][],
  x: number,
): number[] {
  const hits: number[] = []

  for (let i = 1; i < polyline.length; i++) {
    const [x0, y0] = polyline[i - 1]
    const [x1, y1] = polyline[i]
    const minX = Math.min(x0, x1)
    const maxX = Math.max(x0, x1)

    if (x < minX - 1e-4 || x > maxX + 1e-4) continue

    if (Math.abs(x1 - x0) < 1e-4) {
      if (Math.abs(x - x0) < 1e-2) hits.push(y0, y1)
      continue
    }

    const t = (x - x0) / (x1 - x0)
    if (t >= -1e-4 && t <= 1 + 1e-4) {
      hits.push(y0 + t * (y1 - y0))
    }
  }

  return hits
}

/** Pick y on stroke at x; min y = uppermost in SVG coordinates. */
function yOnPolylineAtX(polyline: [number, number][], x: number): number {
  const hits = yCrossingsAtX(polyline, x)
  if (hits.length) return Math.min(...hits)

  let nearest = polyline[0]
  for (const p of polyline) {
    if (Math.abs(p[0] - x) < Math.abs(nearest[0] - x)) nearest = p
  }
  return nearest[1]
}

/** Topmost y at x across one or more subpaths (no phantom chords between sections). */
function yOnProfileAtX(polylines: [number, number][][], x: number): number {
  let best = Infinity
  for (const poly of polylines) {
    if (!poly.length) continue
    const y = yOnPolylineAtX(poly, x)
    if (y < best) best = y
  }
  return best
}

/** Roofline y at x from dense samples (captures spires between grid lines). */
function ridgeYAtX(
  polylines: [number, number][][],
  x: number,
  halfBucket: number,
): number {
  let best = Infinity
  for (const poly of polylines) {
    for (const [px, py] of poly) {
      if (Math.abs(px - x) <= halfBucket && py < best) best = py
    }
  }
  if (best < Infinity) return best
  return yOnProfileAtX(polylines, x)
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

/**
 * Gravity-style morph: x stays fixed across the span, only y moves.
 * Cable at each x drops vertically onto the skyline ridge at that x.
 * Uses the same polyline representation at t=0 and t=1 (no path swap).
 */
export function createOpenPathMorph(
  fromD: string,
  toD: string,
  maxSegmentLength: number,
  spanWidth = BRIDGE_VIEW.width,
): (t: number) => string {
  const fromPolylines = subpathPolylines(fromD)
  const toPolylines = subpathPolylines(toD)

  const count = Math.max(3, Math.ceil(spanWidth / maxSegmentLength))
  const halfBucket = spanWidth / count / 2
  const xs: number[] = []
  for (let i = 0; i < count; i++) {
    xs.push((spanWidth * i) / (count - 1))
  }

  const fromYs = xs.map((x) => ridgeYAtX(fromPolylines, x, halfBucket))
  const toYs = xs.map((x) => ridgeYAtX(toPolylines, x, halfBucket))

  return (t: number) => {
    const progress = smoothstep(t)
    const points = xs.map((x, i) => [
      x,
      fromYs[i] + progress * (toYs[i] - fromYs[i]),
    ] as [number, number])
    return openPathFromPoints(points)
  }
}
