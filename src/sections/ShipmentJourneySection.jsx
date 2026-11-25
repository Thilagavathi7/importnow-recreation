import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { FlagIcon } from '../components/ui/BrandIcons.jsx'
import SectionHeading from '../components/ui/SectionHeading.jsx'
import shipmentStages, {
  getShipProgress,
  getVoyageDay,
  JOURNEY_STEP_THRESHOLDS,
} from '../data/shipmentStages.js'

const VoyageScene = lazy(() => import('../components/visuals/VoyageScene.jsx'))

function VoyageBackdrop({ shipRef, progressRef, onSyncUI }) {
  const hostRef = useRef(null)
  const [isInView, setIsInView] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { rootMargin: '100% 0px' },
    )
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  const handleReady = useCallback(() => {
    setIsReady(true)
  }, [])

  return (
    <div className="voyage-visual" ref={hostRef} aria-hidden="true">
      {isInView && (
        <Suspense fallback={null}>
          <VoyageScene
            progressRef={progressRef}
            hostRef={hostRef}
            onReady={handleReady}
            onSyncUI={onSyncUI}
          />
        </Suspense>
      )}
      <div className={`j-loading${isReady ? ' gone' : ''}`} id="jloading">
        Loading 3D scene…
      </div>
      <svg
        className="voyage-visual__fallback"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="voyage-sea" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e0e9f1" />
            <stop offset=".45" stopColor="#9fb4c5" />
            <stop offset="1" stopColor="#5f7890" />
          </linearGradient>
          <linearGradient id="voyage-hull" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#303d4b" />
            <stop offset=".58" stopColor="#142332" />
            <stop offset="1" stopColor="#071320" />
          </linearGradient>
          <linearGradient id="voyage-deck" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e7edf1" />
            <stop offset="1" stopColor="#a8b7c3" />
          </linearGradient>
          <radialGradient id="voyage-sun-glow">
            <stop offset="0" stopColor="#fff" stopOpacity=".9" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id="voyage-soft-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
          <pattern id="voyage-containers" width="56" height="43" patternUnits="userSpaceOnUse">
            <path d="M1 1h54v40H1z" fill="#c85443" />
            <path d="M7 4v34m8-34v34m8-34v34m8-34v34m8-34v34" stroke="#f1b5a9" strokeOpacity=".36" />
          </pattern>
        </defs>

        <rect width="1200" height="800" fill="url(#voyage-sea)" />
        <circle cx="850" cy="210" r="220" fill="url(#voyage-sun-glow)" opacity=".42" />
        <circle cx="850" cy="210" r="125" fill="#fff" opacity=".16" filter="url(#voyage-soft-glow)" />

        <g className="voyage-waves" fill="none" stroke="#fff" strokeOpacity=".28">
          <path d="M0 470c160-28 300 30 460 0s300-30 460 0 160 25 280-2" />
          <path d="M0 525c150-30 320 25 480-5s300-28 450 3 180 19 270-3" />
          <path d="M0 590c210-30 330 20 480-4s320-35 500 0 130 23 220-2" />
          <path d="M0 655c175-25 310 25 495-4s300-27 470 0 160 25 235 1" />
          <path d="M-120 735c215-38 345 25 540-4s332-29 510 0 170 20 360-8" />
        </g>

        <g className="voyage-route">
          <path
            d="M280 440C435 370 510 560 670 485s184-164 360-106"
            fill="none"
            stroke="#fff"
            strokeOpacity=".68"
            strokeWidth="2"
            strokeDasharray="5 9"
          />
          <circle cx="280" cy="440" r="8" fill="#e3241b" />
          <circle cx="1030" cy="379" r="8" fill="#e3241b" />
          <circle cx="280" cy="440" r="18" fill="#e3241b" opacity=".17" />
          <circle cx="1030" cy="379" r="18" fill="#e3241b" opacity=".17" />
        </g>

        <g className="voyage-ship" ref={shipRef} transform="translate(480 425)">
          <ellipse cx="70" cy="126" rx="155" ry="17" fill="#17344d" opacity=".26" />
          <path d="m-60 92 275 0-28 39H-25z" fill="url(#voyage-hull)" />
          <path d="M-29 91h231l-14 17H-18z" fill="#bf3127" />
          <path d="M-15 77h213v15H-15z" fill="url(#voyage-deck)" />
          <g stroke="#536474" strokeWidth="2">
            <path d="M-1 35h53v42H-1zM55 35h53v42H55zM111 35h53v42h-53z" fill="url(#voyage-containers)" />
            <path d="M-1-8h53v42H-1zM55-8h53v42H55zM111-8h53v42h-53z" fill="#315c78" />
          </g>
          <path d="M164 44h34v33h-34z" fill="#eef2f4" stroke="#536474" strokeWidth="2" />
          <path d="M172 52h18v12h-18z" fill="#85aac4" />
          <path d="M178 44V16h3v28m-8-28h18" stroke="#64788a" strokeWidth="3" />
          <path d="M-61 95h273" stroke="#ff7663" strokeWidth="2" opacity=".75" />
        </g>

        <g className="voyage-port voyage-port--china">
          <path d="M120 405v-92m0 14 65 0m-65 0 54 46m0-46v-34m-54 34v-34" fill="none" stroke="#344c60" strokeWidth="5" />
          <path d="M91 406h59m-30-93 30 14m-30-14-29 14" stroke="#344c60" strokeWidth="5" />
        </g>
        <g className="voyage-port voyage-port--india">
          <path d="M1060 405v-92m0 14 65 0m-65 0 54 46m0-46v-34m-54 34v-34" fill="none" stroke="#344c60" strokeWidth="5" />
          <path d="M1030 406h60m-30-93 30 14m-30-14-30 14" stroke="#344c60" strokeWidth="5" />
        </g>
      </svg>
    </div>
  )
}

function ShipmentJourneySection() {
  const sectionRef = useRef(null)
  const shipRef = useRef(null)
  const progressRef = useRef(0)
  const fillRef = useRef(null)
  const boatRef = useRef(null)
  const dayRef = useRef(null)
  const [activeStage, setActiveStage] = useState(0)
  const [routePercent, setRoutePercent] = useState(0)
  const currentStage = shipmentStages[activeStage]

  const syncUI = useCallback((shipPercent, day) => {
    if (fillRef.current) {
      fillRef.current.style.width = `${shipPercent}%`
    }
    if (boatRef.current) {
      boatRef.current.style.left = `${shipPercent}%`
    }
    if (day !== null && dayRef.current) {
      dayRef.current.textContent = `Day ${day}`
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const ship = shipRef.current
    if (!section || !ship) return undefined

    let frame = 0
    let lastStage = -1

    function updateJourney() {
      const bounds = section.getBoundingClientRect()
      const scrollableDistance = Math.max(
        section.offsetHeight - window.innerHeight,
        1,
      )
      const amount = Math.max(
        0,
        Math.min(1, -bounds.top / scrollableDistance),
      )
      progressRef.current = amount
      const x = 340 + amount * 510
      const y = 412 + Math.sin(amount * Math.PI) * 90

      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        ship.setAttribute('transform', `translate(${x} ${y})`)

        let stage = 0
        for (let i = 0; i < JOURNEY_STEP_THRESHOLDS.length; i += 1) {
          if (amount >= JOURNEY_STEP_THRESHOLDS[i]) stage = i
        }
        const shipPct = getShipProgress(amount) * 100
        const day = getVoyageDay(amount)

        const host = section.querySelector('.voyage-visual')
        if (!host || host.dataset.renderer !== 'three') {
          if (fillRef.current) fillRef.current.style.width = `${shipPct}%`
          if (boatRef.current) boatRef.current.style.left = `${shipPct}%`
          if (dayRef.current) dayRef.current.textContent = `Day ${day}`
        }

        if (stage !== lastStage) {
          lastStage = stage
          setActiveStage(stage)
          setRoutePercent(Math.round(shipPct))
        }
      })
    }

    updateJourney()
    window.addEventListener('scroll', updateJourney, { passive: true })
    window.addEventListener('resize', updateJourney)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateJourney)
      window.removeEventListener('resize', updateJourney)
    }
  }, [])

  const progressAriaValue =
    activeStage === shipmentStages.length - 1 ? 100 : routePercent

  return (
    <section
      className="shipment-journey"
      id="journey"
      ref={sectionRef}
      aria-label="China to India shipment journey"
    >
      <div className="shipment-journey__sticky">
        <VoyageBackdrop
          shipRef={shipRef}
          progressRef={progressRef}
          onSyncUI={syncUI}
        />
        <div className="shipment-journey__shade" />
        <div className="j-badge" aria-hidden="true">
          <i />
          Live shipment view
        </div>
        <div className="section-container shipment-journey__container">
          <div className="shipment-journey__content">
            <div className="shipment-journey__intro">
              <SectionHeading
                eyebrow="How it works"
                title="Watch your order travel from China to India."
              />
            </div>

            <ol className="journey-steps" id="jsteps" aria-label="Import journey stages">
              {shipmentStages.map((stage, index) => {
                const isActive = index === activeStage
                const isComplete = index < activeStage

                return (
                  <li
                    className={`journey-step${isActive ? ' is-active' : ''}${isComplete ? ' is-complete' : ''}`}
                    key={stage.number}
                  >
                    <button
                      type="button"
                      className="journey-step__button"
                      aria-current={isActive ? 'step' : undefined}
                      onClick={() => {
                        const section = sectionRef.current
                        if (!section) return
                        const scrollableDistance = Math.max(
                          section.offsetHeight - window.innerHeight,
                          1,
                        )
                        const targetFraction =
                          index === shipmentStages.length - 1
                            ? 1
                            : JOURNEY_STEP_THRESHOLDS[index] + 0.015
                        const destination =
                          section.getBoundingClientRect().top +
                          window.scrollY +
                          scrollableDistance * targetFraction
                        window.scrollTo({
                          top: destination,
                          behavior: window.matchMedia(
                            '(prefers-reduced-motion: reduce)',
                          ).matches
                            ? 'auto'
                            : 'smooth',
                        })
                      }}
                    >
                      <span className="journey-step__number">
                        <span className="journey-step__num-short" aria-hidden="true">
                          {stage.shortNumber}
                        </span>
                        <span className="sr-only">{stage.number}</span>
                      </span>
                      <span className="journey-step__body">
                        <span className="journey-step__title">{stage.title}</span>
                        <span className="journey-step__desc">{stage.description}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>

            <div className="journey-current sr-only" aria-live="polite">
              <span>Step {activeStage + 1} of {shipmentStages.length}: </span>
              <strong>{currentStage.title}</strong> — {currentStage.description}
            </div>

            <div className="journey-route" aria-label="Shipping route progress">
              <div className="journey-route__endpoint">
                <FlagIcon country="cn" />
                <span>
                  <strong className="pname">Shanghai</strong>
                  <small>Origin port</small>
                </span>
              </div>
              <div
                className="journey-route__track"
                role="progressbar"
                aria-label="Import journey progress"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={progressAriaValue}
              >
                <span
                  className="journey-route__fill"
                  ref={fillRef}
                  style={{ width: `${progressAriaValue}%` }}
                />
                <span
                  className="journey-route__ship"
                  ref={boatRef}
                  style={{ left: `${progressAriaValue}%` }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M3 17l1.6 3.2c.2.4.6.8 1.1.8h12.6c.5 0 .9-.3 1.1-.8L21 17H3zM5 17V12h14v5M8 12V8h8v4M11 8V4h3v4M2 22c1.5-.8 3-.8 4.5 0s3 .8 4.5 0 3-.8 4.5 0 3 .8 4.5 0" />
                  </svg>
                </span>
              </div>
              <div className="journey-route__endpoint journey-route__endpoint--end">
                <span>
                  <strong className="pname">Chennai</strong>
                  <small>Destination</small>
                </span>
                <FlagIcon country="in" />
              </div>
              <div className="journey-route__day" ref={dayRef}>
                Day 0
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ShipmentJourneySection
