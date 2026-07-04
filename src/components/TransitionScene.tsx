import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  BRIDGE_PATHS,
  BRIDGE_TOWER_STROKE_IDS,
  BRIDGE_VIEW,
  STREET_LIGHTS,
  type BridgeStrokeId,
} from '../scenes/bridgeGeometry'
import { clearStipple, renderStipple } from '../dither/stipplePath'
import { createOpenPathMorph, samplePathByX } from '../scenes/openPathMorph'
import {
  SKYLINE_MORPH_TARGET,
  SKYLINE_REVEAL_PATHS,
  WINDOW_LIGHTS,
} from '../scenes/skylineOutline'
import {
  BRIDGE_FADE_STROKES,
  BRIDGE_RENDER_ORDER,
  BRIDGE_TOWER_FADE_STROKES,
  DITHER_TIMING,
  MORPH_SEGMENT_LENGTH,
  STIPPLE_CELL_SIZE,
  STIPPLE_DOT_RADIUS,
  STIPPLE_SAMPLE_LENGTH,
  MORPH_TIMING,
  SCROLL_END,
  SKYLINE_MORPH_STROKE,
  STABLE_PROGRESS,
} from '../scenes/morphPlan'
import { useTheme, type Theme } from '../hooks/useTheme'
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
    deckSuspenders: null,
    topCable: null,
    leftSuspender: null,
    centerSuspender: null,
    rightPillar: null,
    rightSuspender: null,
  }
}

function sceneInk(): string {
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--scene-ink').trim() ||
    '#e05b35'
  )
}

function lightTargets(progress: number, theme: Theme) {
  if (theme === 'light') {
    return { street: 0, window: 0 }
  }

  const bridgeStable = progress <= STABLE_PROGRESS.bridgeMax
  const skylineStable = progress >= STABLE_PROGRESS.skylineMin

  return {
    street: bridgeStable ? 1 : 0,
    window: skylineStable ? 1 : 0,
  }
}

export function TransitionScene() {
  const { theme, toggleTheme } = useTheme()
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const morphRefs = useRef(emptyMorphRefs())
  const stippleRef = useRef<SVGGElement>(null)
  const revealRef = useRef<SVGGElement>(null)
  const streetLightsRef = useRef<SVGGElement>(null)
  const windowLightsRef = useRef<SVGGElement>(null)
  const scrollProgressRef = useRef(0)
  const themeRef = useRef(theme)

  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  useGSAP(
    () => {
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      const towerEls = BRIDGE_TOWER_STROKE_IDS.map((id) => morphRefs.current[id]).filter(
        Boolean,
      ) as SVGPathElement[]
      const towerFadeEls = BRIDGE_TOWER_FADE_STROKES.map((id) => morphRefs.current[id]).filter(
        Boolean,
      ) as SVGPathElement[]
      const fadeEls = BRIDGE_FADE_STROKES.map((id) => morphRefs.current[id]).filter(
        Boolean,
      ) as SVGPathElement[]
      const skylineEl = morphRefs.current[SKYLINE_MORPH_STROKE]
      const stippleEl = stippleRef.current
      const cablePath = BRIDGE_PATHS[SKYLINE_MORPH_STROKE]
      const streetLightsEl = streetLightsRef.current
      const windowLightsEl = windowLightsRef.current
      const ink = sceneInk()

      const applyLights = (progress: number, animate: boolean) => {
        const { street, window } = lightTargets(progress, themeRef.current)
        const duration = animate ? 0.5 : 0.12

        if (streetLightsEl) {
          gsap.to(streetLightsEl, { opacity: street, duration, overwrite: true })
        }
        if (windowLightsEl) {
          gsap.to(windowLightsEl, { opacity: window, duration, overwrite: true })
        }
      }

      if (reducedMotion) {
        gsap.set(towerEls, { fill: 'none', stroke: ink })
        gsap.set(towerFadeEls, { opacity: 0 })
        gsap.set(fadeEls, { opacity: 0 })
        gsap.set(stippleEl, { opacity: 0 })
        gsap.set(skylineEl, { opacity: 1 })
        skylineEl?.setAttribute('d', SKYLINE_MORPH_TARGET)
        gsap.set(revealRef.current, { opacity: 1 })
        revealRef.current?.querySelectorAll('path').forEach((p) => {
          gsap.set(p, { attr: { 'stroke-dashoffset': 0 } })
        })
        scrollProgressRef.current = 1
        applyLights(1, false)
        return
      }

      const detailPaths = gsap.utils.toArray<SVGPathElement>(
        '.transition-reveal__path',
        revealRef.current,
      )
      detailPaths.forEach(prepDraw)
      gsap.set(revealRef.current, { opacity: 0 })
      gsap.set(streetLightsEl, { opacity: 0 })
      gsap.set(windowLightsEl, { opacity: 0 })

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

      const towerBridgeStyle = { fill: ink, stroke: 'none' }
      const towerSkylineStyle = { fill: 'none', stroke: ink }

      gsap.set(towerEls, towerBridgeStyle)
      tl.set(towerEls, towerBridgeStyle, 0)

      tl.to(
        towerEls,
        { ...towerSkylineStyle, duration: 0.08 },
        fadeStart,
      )

      tl.to(towerFadeEls, { opacity: 0, duration: fadeDuration }, fadeStart)
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

        const syncCableVisual = () => {
          const inStipplePhase = ditherState.stippleMix > 0.001

          if (inStipplePhase) {
            const points =
              morphState.t > 0 ? morph.points(morphState.t) : cableSamples
            renderStipple(stippleEl, points, {
              threshold: ditherState.threshold,
              cellSize: STIPPLE_CELL_SIZE,
              dotRadius: STIPPLE_DOT_RADIUS,
            })
            skylineEl.setAttribute('d', morph.path(morphState.t))
          } else {
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
            onUpdate: syncCableVisual,
          },
          DITHER_TIMING.stippleInStart,
        )

        tl.to(
          ditherState,
          {
            threshold: DITHER_TIMING.thresholdEnd,
            duration: morphDuration,
            onUpdate: syncCableVisual,
          },
          morphStart,
        )

        tl.to(
          morphState,
          {
            t: 1,
            duration: morphDuration,
            onUpdate: syncCableVisual,
          },
          morphStart,
        )

        tl.to(
          ditherState,
          {
            crisp: 1,
            duration: DITHER_TIMING.crispDuration,
            onUpdate: syncCableVisual,
          },
          DITHER_TIMING.crispStart,
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
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress
          applyLights(self.progress, false)
        },
      })

      applyLights(0, false)
    },
    { scope: sectionRef },
  )

  useEffect(() => {
    const progress = scrollProgressRef.current
    const { street, window } = lightTargets(progress, theme)
    const duration = 0.5

    if (streetLightsRef.current) {
      gsap.to(streetLightsRef.current, { opacity: street, duration, overwrite: true })
    }
    if (windowLightsRef.current) {
      gsap.to(windowLightsRef.current, { opacity: window, duration, overwrite: true })
    }
  }, [theme])

  return (
    <section ref={sectionRef} className="transition-scene">
      <button
        type="button"
        className="transition-scene__toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? 'Dark mode' : 'Light mode'}
      </button>
      <div ref={pinRef} className="transition-scene__pin">
        <svg
          className="transition-scene__svg"
          viewBox={`0 0 ${BRIDGE_VIEW.width} ${BRIDGE_VIEW.height}`}
          preserveAspectRatio="xMidYMax meet"
          role="img"
          aria-label="Suspension bridge transforming into the San Francisco skyline"
        >
          <rect
            className="transition-scene__bg"
            x={0}
            y={0}
            width={BRIDGE_VIEW.width}
            height={BRIDGE_VIEW.height}
          />
          <g
            ref={streetLightsRef}
            className="transition-scene__streetlights"
            opacity={0}
            aria-hidden="true"
          >
            {STREET_LIGHTS.map((lamp, i) => (
              <g key={i}>
                <line
                  className="transition-scene__streetlight-post"
                  x1={lamp.x}
                  y1={lamp.baseY}
                  x2={lamp.x}
                  y2={lamp.headY}
                />
                <circle
                  className="transition-scene__streetlight-bulb"
                  cx={lamp.x}
                  cy={lamp.headY}
                  r={3}
                />
                <ellipse
                  className="transition-scene__streetlight-pool"
                  cx={lamp.x}
                  cy={lamp.baseY + 1}
                  rx={9}
                  ry={2.5}
                />
              </g>
            ))}
          </g>
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
          <g
            ref={windowLightsRef}
            className="transition-scene__windows"
            opacity={0}
            aria-hidden="true"
          >
            {WINDOW_LIGHTS.map((win, i) => (
              <rect
                key={i}
                className="transition-scene__window"
                x={win.x - win.w / 2}
                y={win.y}
                width={win.w}
                height={win.h}
                rx={0.6}
              />
            ))}
          </g>
        </svg>
      </div>
    </section>
  )
}
