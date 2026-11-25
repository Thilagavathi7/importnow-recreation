import LineIcon from '../components/ui/LineIcon.jsx'
import SectionHeading from '../components/ui/SectionHeading.jsx'
import services from '../data/services.js'

function ServicesSection() {
  return (
    <section className="section services-section" id="services">
      <div className="section-container">
        <SectionHeading
          eyebrow="End-to-end imports"
          title={
            <>
              One team from the <span className="accent-text">factory floor</span>{' '}
              to your front door.
            </>
          }
          description="Anyone can say they import from China. What you actually need is a smooth process, clear communication and a shipment that arrives safely."
        />

        <div className="services-grid">
          {services.map((service, index) => (
            <article
              className={`service-card tilt rv${index % 3 === 1 ? ' d1' : index % 3 === 2 ? ' d2' : ''}`}
              key={service.number}
            >
              <span className="service-card__number">{service.number}</span>
              <div className="service-card__icon">
                <LineIcon name={service.icon} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
