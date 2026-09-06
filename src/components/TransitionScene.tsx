import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  BRIDGE_PATHS,
  BRIDGE_VIEW,
  type BridgeStrokeId,
} from '../scenes/bridgeGeometry'
import { clearStipple, renderStipple } from '../dither/stipplePath'
import { createOpenPathMorph, createContourMorph, samplePathByX } from '../scenes/openPathMorph'
import {
  SKYLINE_MORPH_TARGET,
  SKYLINE_REVEAL_PATHS,
} from '../scenes/skylineOutline'
import {
  BRIDGE_FADE_STROKES,
  BRIDGE_RENDER_ORDER,
  DITHER_TIMING,
  MORPH_SEGMENT_LENGTH,
  STIPPLE_CELL_SIZE,
  STIPPLE_DOT_RADIUS,
  STIPPLE_SAMPLE_LENGTH,
  MORPH_TIMING,
  SCROLL_END,
  SKYLINE_MORPH_STROKE,
} from '../scenes/morphPlan'
import { HANDS_OUTLINE, HANDS_DETAILS } from '../scenes/handsGeometry'
import './TransitionScene.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function prepDraw(path: SVGPathElement) {
  const length = path.getTotalLength()
  gsap.set(path, {
    attr: { 'stroke-dasharray': length, 'stroke-dashoffset': length },
  })
  return length
}

function emptyMorphRefs(): Record<BridgeStrokeId, SVGPathElement | null> {
  return Object.fromEntries(
    BRIDGE_RENDER_ORDER.map(id => [id, null]),
  ) as Record<BridgeStrokeId, SVGPathElement | null>
}

export function TransitionScene() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const morphRefs = useRef(emptyMorphRefs())
  const stippleRef = useRef<SVGGElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const handsRef = useRef<SVGGElement>(null)
  const revealRef = useRef<SVGGElement>(null)

  useGSAP(
    () => {
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      const fadeEls = BRIDGE_FADE_STROKES.map((id) => morphRefs.current[id]).filter(
        Boolean,
      ) as SVGPathElement[]
      const skylineEl = morphRefs.current[SKYLINE_MORPH_STROKE]
      const stippleEl = stippleRef.current
      const cablePath = BRIDGE_PATHS[SKYLINE_MORPH_STROKE]
      // GSAP mutates d directly; restore the current geometry on every setup.
      skylineEl?.setAttribute('d', cablePath)

      if (reducedMotion) {
        const showStage = (progress: number) => {
          const stage = progress < 0.33 ? 0 : progress < 0.67 ? 1 : 2
          gsap.set(fadeEls, { opacity: stage === 0 ? 1 : 0 })
          gsap.set(stippleEl, { opacity: 0 })
          gsap.set(skylineEl, { opacity: 1 })
          skylineEl?.setAttribute('d', stage === 0 ? cablePath : stage === 1 ? SKYLINE_MORPH_TARGET : HANDS_OUTLINE)
          gsap.set(revealRef.current, { opacity: stage === 1 ? 1 : 0 })
          gsap.set(handsRef.current, { opacity: stage === 2 ? 1 : 0 })
          gsap.set(svgRef.current, { y: 0 })
        }
        showStage(0)
        ScrollTrigger.create({
          trigger: sectionRef.current, start: 'top top', end: SCROLL_END,
          pin: pinRef.current, onUpdate: self => showStage(self.progress),
          onRefresh: self => showStage(self.progress),
        })
        return
      }

      const detailPaths = gsap.utils.toArray<SVGPathElement>(
        '.transition-reveal__path',
        revealRef.current,
      )
      const handDetails = gsap.utils.toArray<SVGPathElement>('path', handsRef.current)
      handDetails.forEach(prepDraw)
      gsap.set(handsRef.current, { opacity: 0 })
      gsap.set(svgRef.current, { y: 0 })
      detailPaths.forEach(prepDraw)
      gsap.set(revealRef.current, { opacity: 0 })

      const tl = gsap.timeline({ defaults: { ease: 'none' } })
      const {
        fadeStart,
        fadeDuration,
        morphStart,
        morphDuration,
        detailFadeStart,
        detailFadeDuration,
        detailDrawStart,
        detailDrawDuration,
      } = MORPH_TIMING

      tl.to(fadeEls, { opacity: 0, duration: fadeDuration }, fadeStart)

      if (skylineEl && stippleEl) {
        const morph = createOpenPathMorph(
          cablePath,
          SKYLINE_MORPH_TARGET,
          MORPH_SEGMENT_LENGTH,
          BRIDGE_VIEW.width,
        )
        const cableSamples = samplePathByX(
          cablePath,
          STIPPLE_SAMPLE_LENGTH,
          BRIDGE_VIEW.width,
        )
        const morphState = { t: 0 }
        const ditherState = {
          threshold: DITHER_TIMING.thresholdStart,
          crisp: 1,
          stippleMix: 0,
        }

        gsap.set(skylineEl, { opacity: 1 })
        gsap.set(stippleEl, { opacity: 0 })
        clearStipple(stippleEl)

        const handsMorph = createContourMorph(SKYLINE_MORPH_TARGET, HANDS_OUTLINE)
        const handsState = { t: 0, mix: 0, crisp: 0 }
        const syncCableVisual = () => {
          if (handsState.mix > 0) {
            skylineEl.setAttribute('d', handsMorph.path(handsState.t))
            renderStipple(stippleEl, handsMorph.points(handsState.t), {
              threshold: 0.7 + handsState.t * 0.28,
              cellSize: STIPPLE_CELL_SIZE, dotRadius: STIPPLE_DOT_RADIUS,
            })
            gsap.set(skylineEl, { opacity: 1 - handsState.mix + handsState.mix * handsState.crisp })
            gsap.set(stippleEl, { opacity: handsState.mix * (1 - handsState.crisp) })
            return
          }
          const inStipplePhase = ditherState.stippleMix > 0.001

          if (inStipplePhase) {
            const points =
              morphState.t > 0 ? morph.points(morphState.t) : cableSamples
            renderStipple(stippleEl, points, {
              threshold: ditherState.threshold,
              cellSize: STIPPLE_CELL_SIZE,
              dotRadius: STIPPLE_DOT_RADIUS,
            })
            skylineEl.setAttribute('d', morphState.t >= 1 ? SKYLINE_MORPH_TARGET : morph.path(morphState.t))
          } else {
            skylineEl.setAttribute('d', cablePath)
            clearStipple(stippleEl)
          }

          const pathOpacity =
            1 - ditherState.stippleMix + ditherState.stippleMix * ditherState.crisp
          const stippleOpacity = ditherState.stippleMix * (1 - ditherState.crisp)

          gsap.set(skylineEl, { opacity: pathOpacity })
          gsap.set(stippleEl, { opacity: stippleOpacity })
        }

        tl.to(
          ditherState,
          {
            stippleMix: 1,
            crisp: 0,
            duration: DITHER_TIMING.stippleInDuration,
          },
          DITHER_TIMING.stippleInStart,
        )

        tl.to(
          ditherState,
          {
            threshold: DITHER_TIMING.thresholdEnd,
            duration: morphDuration,
          },
          morphStart,
        )

        tl.to(
          morphState,
          {
            t: 1,
            duration: morphDuration,
          },
          morphStart,
        )

        tl.to(
          ditherState,
          {
            crisp: 1,
            duration: DITHER_TIMING.crispDuration,
          },
          DITHER_TIMING.crispStart,
        )
        // A hold on the finished skyline separates the second and third artworks.
        tl.to(handsState, { mix: 1, duration: 0.08 }, 1.65)
        tl.to(handsState, { t: 1, duration: 0.65 }, 1.69)
        tl.to(handsState, { crisp: 1, duration: 0.12 }, 2.28)
        // One renderer owns d/opacity, including during reverse scrubbing.
        tl.eventCallback('onUpdate', syncCableVisual)
      }

      tl.to(
        revealRef.current,
        { opacity: 1, duration: detailFadeDuration },
        detailFadeStart,
      )

      tl.to(
        detailPaths,
        {
          attr: { 'stroke-dashoffset': 0 },
          duration: detailDrawDuration,
        },
        detailDrawStart,
      )

      tl.to(revealRef.current, { opacity: 0, duration: 0.18 }, 1.43)
      tl.to(handsRef.current, { opacity: 1, duration: 0.18 }, 2.34)
      tl.to(handDetails, { attr: { 'stroke-dashoffset': 0 }, duration: 0.23 }, 2.34)
      // Final hold lets the hands settle before the pin ends.
      tl.to({}, { duration: 0.25 }, 2.57)

      ScrollTrigger.create({
        invalidateOnRefresh: true,
        trigger: sectionRef.current,
        start: 'top top',
        end: SCROLL_END,
        pin: pinRef.current,
        scrub: 1,
        animation: tl,
        anticipatePin: 1,
      })
    },
    { scope: sectionRef, dependencies: [BRIDGE_PATHS, SKYLINE_MORPH_TARGET, SKYLINE_REVEAL_PATHS, HANDS_OUTLINE], revertOnUpdate: true },
  )

  return (
    <section ref={sectionRef} className="transition-scene">
      <div ref={pinRef} className="transition-scene__pin">
        <svg
          ref={svgRef}
          className="transition-scene__svg"
          viewBox={`0 0 ${BRIDGE_VIEW.width} ${BRIDGE_VIEW.height}`}
          preserveAspectRatio="xMidYMax meet"
          role="img"
          aria-label="Golden Gate Bridge transforming into San Francisco landmarks and then two reaching hands"
        >
          <g className="transition-scene__morph">
            {BRIDGE_RENDER_ORDER.map((id) => (
              <path
                key={id}
                ref={(el) => {
                  morphRefs.current[id] = el
                }}
                className={`transition-scene__stroke transition-scene__stroke--${id}${
                  id === SKYLINE_MORPH_STROKE
                    ? ' transition-scene__stroke--ditherTarget'
                    : ''
                }`}
                d={BRIDGE_PATHS[id]}
              />
            ))}
            <g
              ref={stippleRef}
              className="transition-scene__stipple"
              aria-hidden="true"
            />
          </g>
          <g ref={revealRef} className="transition-scene__reveal" opacity={0}>
            {SKYLINE_REVEAL_PATHS.map((d, i) => (
              <path
                key={i}
                className="transition-scene__stroke transition-reveal__path"
                d={d}
                fill="none"
              />
            ))}
          </g>
          <g ref={handsRef} opacity={0}>
            {HANDS_DETAILS.map((d, i) => (
              <path key={i} d={d} className="transition-scene__stroke transition-reveal__path" />
            ))}
          </g>
        </svg>
      </div>
    </section>
  )
}
