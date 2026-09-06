/** Original line interpretation of the adult/child pose in Nokia's classic image.
 * Reference: https://vectorified.com/image/nokia-logo-vector-29.png
 * Cupped adult palm, curled fingertips and a smaller reaching hand.
 */
const adult = [
  'M320 255 C355 255 376 167 410 167',
  'C432 169 443 163 456 156 C481 145 509 143 529 147',
  'C548 153 565 153 584 154 L610 157 C621 158 625 163 622 171',
  'C620 180 609 185 598 185 C581 185 566 181 550 181 L538 181',
  'C539 193 550 201 563 208 C584 222 607 229 628 234',
  'L673 242 C686 243 695 247 695 255 C696 265 685 272 674 274',
  'L642 282 C631 287 622 294 611 299 C602 304 591 304 582 301',
  'C570 309 555 310 541 308 C518 307 505 304 488 297',
  'C468 288 449 278 435 264 C425 252 416 246 401 244 L363 238',
].join(' ')
const child = [
  'M958 253 C911 255 874 261 839 261 C816 261 798 259 782 252',
  'L762 244 C756 241 749 242 742 243 L724 246',
  'C716 246 711 249 712 253 C713 258 722 258 729 257 L747 255',
  'L761 264 C748 260 738 260 731 266 L709 279',
  'C702 283 701 287 705 290 C710 294 716 289 721 286 L739 276 L753 276',
  'C742 284 733 295 726 305 C721 311 721 315 727 316',
  'C733 317 738 310 742 305 L755 290 L767 286',
  'L752 305 C748 310 749 315 754 315 C760 314 764 308 768 303 L781 291',
  'L798 289 C792 300 779 305 770 309 C762 313 760 320 765 325',
  'C770 331 780 328 789 324 L818 314 C831 310 841 305 850 299',
  'C879 294 898 255 940 255',
].join(' ')
const details = [
  // Thumb pad and palm creases, with overlapping fingertips instead of a fan.
  'M529 149 C535 160 539 173 538 181 M448 191 C467 215 494 225 518 220 M466 215 C490 242 525 239 549 223 M498 297 C505 275 523 260 542 254 M516 302 C522 284 538 280 551 281 C563 280 571 265 580 257 C588 250 596 251 600 257 C605 264 598 272 592 276 L571 298 M582 301 C594 293 609 276 618 263 C625 254 632 252 640 255 C646 258 641 266 635 272 M642 282 C651 274 658 263 668 257 C676 251 685 252 690 256',
  // Small finger joints, thumb fold and softly bent wrist.
  'M762 244 C762 252 768 258 775 261 M753 276 L763 281 M781 291 C793 283 798 278 800 271 M818 266 C824 277 825 288 818 298 M770 315 C776 312 781 312 785 315',
]

const scale = 0.48
const baseline = 286.2
function place(d: string, adultHand = false): string {
  let isX = true
  return d.replace(/[MLC]|-?\d*\.?\d+/g, token => {
    if (/^[MLC]$/.test(token)) { isX = true; return token }
    // Shrink the adult hand around its fingertip and the shared edge baseline.
    const anchor = isX ? 695 : 255
    const value = adultHand ? anchor + (Number(token) - anchor) * 0.68 : Number(token)
    const result = isX ? 700 + (value - 640) * scale : baseline + (value - 255) * scale
    isX = !isX
    return result.toFixed(3)
  })
}
export const NOKIA_HANDS_OUTLINE = `M0 ${baseline} ${place(adult, true).replace(/^M/, 'L')} ${place(child)} L1400 ${baseline}`
export const NOKIA_HANDS_DETAILS = details.map((d, i) => place(d, i === 0))
