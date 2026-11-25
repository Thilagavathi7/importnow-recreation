import Button from '../components/ui/Button.jsx'
import LineIcon from '../components/ui/LineIcon.jsx'
import SectionHeading from '../components/ui/SectionHeading.jsx'
import businessTrips from '../data/businessTrips.js'

function BusinessTripsSection() {
  return (
    <section className="section business-trips" id="trips">
      <div className="section-container">
        <SectionHeading
          eyebrow="Business trips to China"
          title={
            <>
              Your business trip doesn&apos;t have to{' '}
              <span className="accent-text">feel like work.</span>
            </>
          }
          description="Guided trips to the Canton Fair, wholesale markets and factories you choose. Our clients often tell us it felt like a personal trip, not a business tour."
        />

        <div className="business-trips__grid">
          <article className="business-trip-feature rv">
            <svg
              className="business-trip-feature__skyline"
              viewBox="0 0 600 150"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 150V110h30V80h20v30h25V60h15V40h10v20h15v50h30V70h40v40h20V30l15-25 15 25v80h25V85h30v25h20V50h35v60h25V90h30V20h12V0h6v20h12v90h30V75h40v35h25V95h30v55z" />
            </svg>
            <span className="business-trip-feature__eyebrow">
              Canton Fair · Guangzhou
            </span>
            <h3>Meet factories face to face. We handle everything else.</h3>
            <p>
              Walk the world&apos;s biggest trade fair with a guide who speaks
              the language, then visit the factories you shortlist.
            </p>
            <div className="business-trip-feature__places" aria-label="Example trip locations">
              {businessTrips.locations.map((location) => (
                <span key={location}>{location}</span>
              ))}
            </div>
            <p className="business-trip-feature__note">
              Trip inclusions and locations are based on the reference; confirm
              current availability before making plans.
            </p>
          </article>

          <article className="business-trip-card rv d1">
            <h3>What&apos;s included</h3>
            <ul className="business-trip-inclusions">
              {businessTrips.inclusions.map((item) => (
                <li key={item.text}>
                  <LineIcon name={item.icon} />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="business-trip-card business-trip-seasons rv d2">
            <h3>Next departures</h3>
            <div className="business-trip-seasons__list">
              {businessTrips.seasons.map((season) => (
                <div className="business-trip-season" key={season.name}>
                  <strong>{season.name}</strong>
                  <span>{season.event}</span>
                </div>
              ))}
            </div>
            <p>Dates and arrangements can change; ask for current details.</p>
            <Button href="#contact">Join the next trip →</Button>
          </article>
        </div>
      </div>
    </section>
  )
}

export default BusinessTripsSection
