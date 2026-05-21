import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { interpolate } from 'flubber'
import {
  BRIDGE_PATHS,
  BRIDGE_TOWER_STROKE_IDS,
  BRIDGE_VIEW,
  type BridgeStrokeId,
} from '../scenes/bridgeGeometry'
import { SKYLINE_TARGETS, buildRevealPaths } from '../scenes/skylineTargets'
import {
  MORPH_SEGMENT_LENGTH,
  BRIDGE_RENDER_ORDER,
  MORPH_STROKE_ORDER,
  MORPH_TIMING,
  SCROLL_END,
  getMorphTargetId,
  morphTimeFor,
} from '../scenes/morphPlan'
import './TransitionScene.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const REVEAL_PATHS = buildRevealPaths()

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
    leftCable: null,
    leftSuspender: null,
    centerCable: null,
    centerSuspender: null,
    rightCable: null,
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

      if (reducedMotion) {
        gsap.set(towerEls, { fill: 'none', stroke: '#e05b35' })
        MORPH_STROKE_ORDER.forEach((id) => {
          const el = morphRefs.current[id]
          if (!el) return
          el.setAttribute('d', SKYLINE_TARGETS[getMorphTargetId(id)])
        })
        gsap.set(revealRef.current, { opacity: 1 })
        revealRef.current?.querySelectorAll('path').forEach((p) => {
          gsap.set(p, { attr: { 'stroke-dashoffset': 0 } })
        })
        return
      }

      const revealPaths = gsap.utils.toArray<SVGPathElement>(
        '.transition-reveal__path',
        revealRef.current,
      )
      revealPaths.forEach(prepDraw)
      gsap.set(revealRef.current, { opacity: 0 })

      const tl = gsap.timeline({ defaults: { ease: 'none' } })
      const {
        stagger,
        morphDuration,
        morphStart,
        revealFadeStart,
        revealFadeDuration,
        revealDrawStart,
        revealDrawDuration,
        revealStagger,
      } = MORPH_TIMING

      const leftTower = morphRefs.current.leftPillar
      const rightTower = morphRefs.current.rightPillar

      const towerBridgeStyle = { fill: '#e05b35', stroke: 'none' }
      const towerSkylineStyle = { fill: 'none', stroke: '#e05b35' }

      gsap.set(towerEls, towerBridgeStyle)
      tl.set(towerEls, towerBridgeStyle, 0)

      if (leftTower) {
        tl.to(
          leftTower,
          { ...towerSkylineStyle, duration: 0.08 },
          morphTimeFor('leftPillar'),
        )
      }
      if (rightTower) {
        tl.to(
          rightTower,
          { ...towerSkylineStyle, duration: 0.08 },
          morphTimeFor('rightPillar'),
        )
      }

      MORPH_STROKE_ORDER.forEach((strokeId, i) => {
        const el = morphRefs.current[strokeId]
        if (!el) return

        const from = BRIDGE_PATHS[strokeId]
        const to = SKYLINE_TARGETS[getMorphTargetId(strokeId)]
        const mixer = interpolate(from, to, {
          maxSegmentLength: MORPH_SEGMENT_LENGTH,
        })
        const state = { t: 0 }

        tl.to(
          state,
          {
            t: 1,
            duration: morphDuration,
            onUpdate: () => el.setAttribute('d', mixer(state.t)),
          },
          morphStart + i * stagger,
        )
      })

      tl.to(
        revealRef.current,
        { opacity: 1, duration: revealFadeDuration },
        revealFadeStart,
      )

      tl.to(
        revealPaths,
        {
          attr: { 'stroke-dashoffset': 0 },
          duration: revealDrawDuration,
          stagger: revealStagger,
        },
        revealDrawStart,
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
          preserveAspectRatio="xMidYMid meet"
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
            {REVEAL_PATHS.map((d, i) => (
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
