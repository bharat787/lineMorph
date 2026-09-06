/** Original line studies in the source skyline's coordinate system.
 * References: https://www.loc.gov/item/2013630063/
 * https://sah-archipedia.org/buildings/CA-01-075-0036
 * Shapes simplify architectural features to remain legible at skyline scale.
 */
export const FERRY_OUTLINE = 'L860 682 L860 590 L849 590 L849 578 L744 578 L744 559 L730 559 L730 416 L723 416 L723 401 L716 401 L716 382 L706 382 L706 365 L699 351 L687 351 L680 365 L680 382 L670 382 L670 401 L663 401 L663 416 L656 416 L656 559 L642 559 L642 578 L537 578 L537 590 L526 590 L526 682 L487 682 L487 631.75'

export const PALACE_OUTLINE = 'L1214 682 L1214 569 L1203 569 L1203 553 L1177 553 L1177 521 L1168 521 C1160 479 1140 456 1118 453 C1096 456 1076 479 1068 521 L1059 521 L1059 553 L1033 553 L1033 569 L1021.5 569 L1021.5 682'

function arch(x: number, bottom: number, width: number, spring: number, rise: number): string {
  return `M${x} ${bottom} L${x} ${spring} C${x} ${spring - rise * 1.333} ${x + width} ${spring - rise * 1.333} ${x + width} ${spring} L${x + width} ${bottom}`
}

// Circles are constructed after the source coordinate transform, preserving roundness.
export const FERRY_CLOCK = { x: 693, y: 450, radius: 11 }

export const FERRY_DETAILS = [
  // Matching tower sides, horizontal cornices, belfry and central entry.
  'M656 559 L730 559 M656 487 L730 487 M663 416 L723 416 M670 401 L716 401 M680 382 L706 382 M663 493 L663 574 M723 493 L723 574',
  arch(681, 400, 24, 391, 13) + ' M693 382 L693 400',
  arch(678, 554, 30, 516, 17) + ' M693 501 L693 554',
  'M526 682 L860 682 M526 600 L860 600 M537 590 L642 590 M744 590 L849 590 M642 578 L744 578',
  arch(667, 682, 52, 628, 29),
  // Repeated arcades on the actual terminal wings replace unrelated blocks.
  ...[544, 575, 606, 756, 787, 818].map(x =>
    arch(x, 675, 22, 635, 21) + ` M${x + 11} 614 L${x + 11} 675`,
  ),
]

export const PALACE_DETAILS = [
  // Dome cornice, drum and ribs.
  'M1068 521 L1168 521 M1059 533 L1177 533 M1059 553 L1177 553 M1075 519 C1081 484 1098 459 1118 453 C1138 459 1155 484 1161 519 M1096 519 C1098 482 1106 460 1118 453 C1130 460 1138 482 1140 519',
  // Central arch and two foreshortened side openings.
  arch(1091, 674, 54, 604, 48),
  arch(1066, 674, 17, 612, 38),
  arch(1153, 674, 17, 612, 38),
  // Paired columns with capitals and plinths.
  ...[1058, 1083, 1145, 1170].map(x =>
    `M${x - 2} 558 L${x + 8} 558 L${x + 8} 568 L${x - 2} 568 L${x - 2} 558 M${x} 568 L${x} 670 M${x + 6} 568 L${x + 6} 670 M${x - 3} 674 L${x + 9} 674`,
  ),
  // Flanking colonnades, with lintels rather than invented arches.
  'M1021.5 577 L1058 577 M1178 577 L1214 577 M1028 577 L1028 674 M1036 577 L1036 674 M1048 577 L1048 674 M1187 577 L1187 674 M1199 577 L1199 674 M1207 577 L1207 674 M1021.5 682 L1214 682',
]

/** Symmetric Transamerica elevation with discrete rectangular window bays. */
export const TRANSAMERICA_RIGHT_OUTLINE = 'L421 687 L385 435 L385 330 L373 330 L361 237.5'
export const TRANSAMERICA_LEFT_OUTLINE = 'M361 237.5 L349 330 L337 330 L337 435 L301 687 L299.499939 686.229187'

function pyramidFaceHalfWidth(y: number): number {
  if (y < 330) return (y - 237.5) * 12 / 92.5
  if (y < 435) return 12 + (y - 330) * 12 / 105
  return 24 + (y - 435) * 36 / 252
}

export const TRANSAMERICA_DETAILS = [
  // Service wings flank a centered, straight-sided spire.
  'M349 330 L337 435 M373 330 L385 435',
  ...Array.from({ length: 20 }, (_, row) => {
    const y = 315 + row * 17
    const halfWidth = pyramidFaceHalfWidth(y) - 3
    const windows: string[] = []
    for (let column = -5; column <= 5; column++) {
      const x = 361 + column * 12
      if (Math.abs(x - 361) + 3 > halfWidth) continue
      windows.push(`M${x - 3} ${y} L${x + 3} ${y} L${x + 3} ${y + 9} L${x - 3} ${y + 9} L${x - 3} ${y}`)
    }
    return windows.join(' ')
  }),
  // Six identical structural bays, mirrored around the same center as the tip.
  'M307 659 L415 659 M307 683 L415 683',
  ...Array.from({ length: 6 }, (_, i) => {
    const x = 307 + i * 18
    return `M${x} 683 L${x + 9} 659 L${x + 18} 683`
  }),
]

/** Salesforce: curved horizontal sunshades and a fine vertical crown screen.
 * References: https://pcparch.com/work/salesforce-tower
 * https://www.permasteelisagroup.com/project/salesforce-tower/
 */
const salesforceSections = [
  [195, 1472, 1507], [230, 1464, 1512], [300, 1457, 1519],
  [400, 1451, 1524], [520, 1449, 1526], [680, 1448, 1527],
] as const

function salesforceEdges(y: number): [number, number] {
  for (let i = 1; i < salesforceSections.length; i++) {
    const [y0, left0, right0] = salesforceSections[i - 1]
    const [y1, left1, right1] = salesforceSections[i]
    if (y <= y1) {
      const t = (y - y0) / (y1 - y0)
      return [left0 + (left1 - left0) * t, right0 + (right1 - right0) * t]
    }
  }
  return [1448, 1527]
}

export const SALESFORCE_DETAILS = [
  ...Array.from({ length: 28 }, (_, i) => {
    const y = 216 + i * 17
    const [left, right] = salesforceEdges(y)
    return `M${left} ${y} Q${(left + right) / 2} ${y + 7} ${right} ${y}`
  }),
  ...[0.12, 0.3, 0.5, 0.7, 0.88].map(t =>
    salesforceSections.map(([y, left, right], i) =>
      `${i ? 'L' : 'M'}${left + (right - left) * t} ${y + 3}`,
    ).join(' '),
  ),
  'M1463 248 Q1488 255 1513 248 M1448 681 L1527 681',
]

/** Coit Tower: centered between Ferry's right wing and the Palace colonnade.
 * References: https://www.sfrecpark.org/Facilities/Facility/Details/Coit-Tower-290
 * https://www.ronhenggeler.com/on_the_walls/6717.htm
 */
const coitCenter = (860 + 1021.5) / 2
const coitX = (offset: number) => coitCenter + offset

export const COIT_OUTLINE = [
  `L${coitX(40)} 682 L${coitX(40)} 649 L${coitX(28)} 641`,
  `L${coitX(23)} 472 L${coitX(29)} 453 L${coitX(29)} 383`,
  `Q${coitCenter} 372 ${coitX(-29)} 383`,
  `L${coitX(-29)} 453 L${coitX(-23)} 472 L${coitX(-28)} 641`,
  `L${coitX(-40)} 649 L${coitX(-40)} 682`,
].join(' ')

export const COIT_DETAILS = [
  // Curved parapet and observation-gallery cornices.
  `M${coitX(-29)} 393 Q${coitCenter} 385 ${coitX(29)} 393 M${coitX(-29)} 454 Q${coitCenter} 460 ${coitX(29)} 454 M${coitX(-23)} 472 Q${coitCenter} 477 ${coitX(23)} 472`,
  ...[-22, -6, 14].map((offset, i) => {
    const width = i === 1 ? 12 : 8
    const x = coitX(offset)
    return arch(x, 449, width, 416, 17) + ` L${x} 449`
  }),
  // Small windows beneath the open arches, and long recessed vertical flutes.
  ...[-16, 0, 16].map(offset => {
    const x = coitX(offset)
    return `M${x - 3} 484 L${x + 3} 484 L${x + 3} 494 L${x - 3} 494 L${x - 3} 484 M${x - 3} 509 L${x - 4} 633 M${x + 3} 509 L${x + 4} 633`
  }),
  `M${coitX(-28)} 641 Q${coitCenter} 649 ${coitX(28)} 641 M${coitX(-40)} 655 L${coitX(40)} 655 M${coitX(-40)} 682 L${coitX(40)} 682`,
  arch(coitX(-7), 682, 14, 665, 9),
]
