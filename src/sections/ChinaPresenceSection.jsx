import { useEffect, useRef } from 'react'
import SectionHeading from '../components/ui/SectionHeading.jsx'

const presencePoints = [
  <>
    <strong>Registered business licence</strong> issued in Shanghai, China
  </>,
  <>
    <strong>Chinese company bank account</strong>, so payments to factories are safe and traceable
  </>,
  <>
    <strong>Team on the ground</strong> for factory visits, quality checks and market trips
  </>,
  <>
    <strong>Indian founder on both sides</strong>: talk to us in Telugu, Hindi or English
  </>,
]

function ChinaPresenceSection() {
  const stageRef = useRef(null)
  const licenseRef = useRef(null)

  useEffect(() => {
    const stage = stageRef.current
    const license = licenseRef.current
    if (!stage || !license) return undefined
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    function handleMove(event) {
      const rect = stage.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      license.style.transform = `rotateY(${x * 24}deg) rotateX(${-y * 16}deg)`
    }

    function handleLeave() {
      license.style.transform = ''
    }

    stage.addEventListener('pointermove', handleMove)
    stage.addEventListener('pointerleave', handleLeave)
    return () => {
      stage.removeEventListener('pointermove', handleMove)
      stage.removeEventListener('pointerleave', handleLeave)
    }
  }, [])

  return (
    <section className="section china-presence" id="shanghai">
      <div className="section-container china-presence__grid">
        <div className="china-presence__copy">
          <SectionHeading
            eyebrow="Officially in China"
            title={
              <>
                Many claim an office in China.{' '}
                <span className="accent-text">We have the licence.</span>
              </>
            }
            description={
              <>
                ImportNow operates through its own registered company in
                Shanghai, <strong>Shanghai Shengqiao Chain Trading Co., Ltd.</strong>{' '}
                That means we can sign contracts with factories, pay suppliers
                locally and stand behind every order.
              </>
            }
          />

          <ul className="china-presence__points">
            {presencePoints.map((point, index) => (
              <li className={`rv d${index + 2}`} key={index}>
                <span className="china-presence__check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="china-presence__note">
            Company details and claims shown here are reproduced from the
            reference website and have not been independently verified.
          </p>
        </div>

        <aside
          className="license-stage rv d2"
          aria-label="Shanghai presence"
          ref={stageRef}
        >
          <div className="china-presence-card" id="license" ref={licenseRef}>
            <div className="license__title">营业执照</div>
            <div className="license__subtitle">BUSINESS LICENCE</div>
            <div className="license__emblem" aria-hidden="true" />
            <dl>
              <dt>Company</dt>
              <dd>Shanghai Shengqiao Chain Trading Co., Ltd.</dd>
              <dt>Location</dt>
              <dd>Shanghai, People&apos;s Republic of China</dd>
              <dt>Scope</dt>
              <dd>Supply chain, sourcing &amp; international trade</dd>
              <dt>Serving</dt>
              <dd>Importers across India</dd>
            </dl>
            <div className="license__qr" aria-hidden="true" />
            <div className="license__stamp" aria-hidden="true">
              <span>
                SHANGHAI
                <br />
                SHENGQIAO
                <br />
                TRADING
              </span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default ChinaPresenceSection
