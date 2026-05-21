import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  BRIDGE_PATHS,
  BRIDGE_TOWER_STROKE_IDS,
  BRIDGE_VIEW,
  type BridgeStrokeId,
} from '../scenes/bridgeGeometry'
import { createOpenPathMorph } from '../scenes/openPathMorph'
import {
  SKYLINE_MORPH_TARGET,
  SKYLINE_REVEAL_PATHS,
} from '../scenes/skylineOutline'
import {
  BRIDGE_FADE_STROKES,
  BRIDGE_RENDER_ORDER,
  MORPH_SEGMENT_LENGTH,
  MORPH_TIMING,
  SCROLL_END,
  SKYLINE_MORPH_STROKE,
} from '../scenes/morphPlan'
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
  return {
    deck: null,
    lowerTruss: null,
    leftPillar: null,
    topCable: null,
    leftSuspender: null,
    centerSuspender: null,
    rightPillar: null,
    rightSuspender: null,
  }
}

export function TransitionScene() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const morphRefs = useRef(emptyMorphRefs())
  const revealRef = useRef<SVGGElement>(null)

  useGSAP(
    () => {
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      const towerEls = BRIDGE_TOWER_STROKE_IDS.map((id) => morphRefs.current[id]).filter(
        Boolean,
      ) as SVGPathElement[]
      const fadeEls = BRIDGE_FADE_STROKES.map((id) => morphRefs.current[id]).filter(
        Boolean,
      ) as SVGPathElement[]
      const skylineEl = morphRefs.current[SKYLINE_MORPH_STROKE]

      if (reducedMotion) {
        gsap.set(towerEls, { fill: 'none', stroke: '#e05b35' })
        gsap.set(fadeEls, { opacity: 0 })
        skylineEl?.setAttribute('d', SKYLINE_MORPH_TARGET)
        gsap.set(revealRef.current, { opacity: 1 })
        revealRef.current?.querySelectorAll('path').forEach((p) => {
          gsap.set(p, { attr: { 'stroke-dashoffset': 0 } })
        })
        return
      }

      const detailPaths = gsap.utils.toArray<SVGPathElement>(
        '.transition-reveal__path',
        revealRef.current,
      )
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
        detailStagger,
      } = MORPH_TIMING

      const towerBridgeStyle = { fill: '#e05b35', stroke: 'none' }
      const towerSkylineStyle = { fill: 'none', stroke: '#e05b35' }

      gsap.set(towerEls, towerBridgeStyle)
      tl.set(towerEls, towerBridgeStyle, 0)

      tl.to(
        towerEls,
        { ...towerSkylineStyle, duration: 0.08 },
        fadeStart,
      )

      tl.to(fadeEls, { opacity: 0, duration: fadeDuration }, fadeStart)

      if (skylineEl) {
        const fromPath = BRIDGE_PATHS[SKYLINE_MORPH_STROKE]
        const toPath = SKYLINE_MORPH_TARGET
        const mixer = createOpenPathMorph(
          fromPath,
          toPath,
          MORPH_SEGMENT_LENGTH,
          BRIDGE_VIEW.width,
        )
        const state = { t: 0 }

        tl.to(
          state,
          {
            t: 1,
            duration: morphDuration,
            onUpdate: () => {
              skylineEl.setAttribute('d', mixer(state.t))
            },
          },
          morphStart,
        )
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
          stagger: detailStagger,
        },
        detailDrawStart,
      )

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: SCROLL_END,
        pin: pinRef.current,
        scrub: 1,
        animation: tl,
        anticipatePin: 1,
      })
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="transition-scene">
      <div ref={pinRef} className="transition-scene__pin">
        <svg
          className="transition-scene__svg"
          viewBox={`0 0 ${BRIDGE_VIEW.width} ${BRIDGE_VIEW.height}`}
          preserveAspectRatio="xMidYMax meet"
          role="img"
          aria-label="Suspension bridge transforming into the San Francisco skyline"
        >
          <g className="transition-scene__morph">
            {BRIDGE_RENDER_ORDER.map((id) => (
              <path
                key={id}
                ref={(el) => {
                  morphRefs.current[id] = el
                }}
                className={`transition-scene__stroke transition-scene__stroke--${id}`}
                d={BRIDGE_PATHS[id]}
              />
            ))}
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
        </svg>
      </div>
    </section>
  )
}
