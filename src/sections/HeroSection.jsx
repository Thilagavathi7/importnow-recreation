import { lazy, Suspense, useEffect, useState } from 'react'
import { FlagIcon } from '../components/ui/BrandIcons.jsx'
import Button from '../components/ui/Button.jsx'

const EarthGlobe = lazy(() => import('../components/visuals/EarthGlobe.jsx'))

function CountUpNumber({ target }) {
  const [value, setValue] = useState(target)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    let frame = 0
    const duration = 1600
    const start = performance.now()

    function step(now) {
      const k = Math.min(1, (now - start) / duration)
      setValue(Math.round(target * (1 - Math.pow(1 - k, 3))))
      if (k < 1) {
        frame = window.requestAnimationFrame(step)
      }
    }

    frame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frame)
  }, [target])

  return <>{value}</>
}

const referenceStats = [
  { count: 500, suffix: '+', label: <>Businesses<br />served</> },
  { count: 83, suffix: 'K+', label: <>Community on<br />Instagram</> },
  { value: '1 pc', label: <>MOQ on many<br />products</> },
  { value: 'Shanghai', label: <>Own registered<br />company</> },
]

function HeroSection() {
  return (
    <section className="hero-section" id="home" aria-labelledby="hero-title">
      <Suspense fallback={<div className="earth-globe-fallback" />}>
        <EarthGlobe />
      </Suspense>

      <div className="hero-section__inner">
        <div className="hero-section__content">
          <div className="hero-trust-badge rv in">
            <span className="hero-trust-badge__flags" aria-hidden="true">
              <FlagIcon country="cn" />
              <span className="hero-trust-badge__arrow">→</span>
              <FlagIcon country="in" />
            </span>
            Trusted by 500+ Indian businesses
          </div>

          <h1 className="hero-section__title rv d1" id="hero-title">
            Import directly from China.{' '}
            <span>Without the guesswork.</span>
          </h1>

          <p className="hero-section__description rv d2">
            Sourcing, factory inspection, shipping and customs, handled end to
            end by a team with its own company in Shanghai. You choose the
            product. We bring it to your door.
          </p>

          <div className="hero-section__actions rv d3">
            <Button href="#contact">
              Get a free sourcing quote <span aria-hidden="true">→</span>
            </Button>
            <Button href="#journey" variant="secondary">
              See how it works
            </Button>
          </div>

          <div className="hero-snapshot rv d4" aria-label="ImportNow reference facts">
            {referenceStats.map((stat) => (
              <div className="hero-snapshot__item" key={stat.value ?? stat.count}>
                <strong>
                  {stat.count !== undefined ? (
                    <>
                      <CountUpNumber target={stat.count} />
                      {stat.suffix}
                    </>
                  ) : (
                    stat.value
                  )}
                </strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <a className="hero-scroll-cue" href="#routes" aria-label="Scroll to explore">
        <span>Scroll</span>
        <i aria-hidden="true" />
      </a>
    </section>
  )
}

export default HeroSection
