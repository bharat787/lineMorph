import { bayerPasses } from './bayer'

const SVG_NS = 'http://www.w3.org/2000/svg'

export type StippleOptions = {
  threshold: number
  cellSize?: number
  dotRadius?: number
}

export function clearStipple(group: SVGGElement): void {
  while (group.firstChild) {
    group.removeChild(group.firstChild)
  }
}

/** Paint stippled circles into an SVG group (clears previous children). */
export function renderStipple(
  group: SVGGElement,
  points: [number, number][],
  { threshold, cellSize = 5, dotRadius = 1.35 }: StippleOptions,
): void {
  while (group.firstChild) {
    group.removeChild(group.firstChild)
  }

  if (threshold <= 0) return

  const fragment = document.createDocumentFragment()

  for (const [x, y] of points) {
    if (!bayerPasses(x, y, threshold, cellSize)) continue

    const dot = document.createElementNS(SVG_NS, 'circle')
    dot.setAttribute('cx', x.toFixed(2))
    dot.setAttribute('cy', y.toFixed(2))
    dot.setAttribute('r', String(dotRadius))
    fragment.appendChild(dot)
  }

  group.appendChild(fragment)
}
