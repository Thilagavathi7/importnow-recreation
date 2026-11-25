import { FlagIcon } from '../components/ui/BrandIcons.jsx'
import LineIcon from '../components/ui/LineIcon.jsx'
import SectionHeading from '../components/ui/SectionHeading.jsx'
import caseStudies from '../data/caseStudies.js'

function CaseStudiesSection() {
  return (
    <section className="section case-studies" id="work">
      <div className="section-container">
        <SectionHeading
          eyebrow="Illustrative examples"
          title={
            <>
              Import ideas, from the factory{' '}
              <span className="accent-text">to your business.</span>
            </>
          }
          description="These sample project cards reflect product types described on the reference site. They are not verified client shipments."
        />

        <div className="case-studies__grid">
          {caseStudies.map((study, index) => (
            <article
              className={`case-study-card tilt rv${index > 0 ? ` d${index}` : ''}`}
              key={study.title}
            >
              <div className={`case-study-card__visual tone-${study.tone}`}>
                <LineIcon name={study.icon} strokeWidth={1.3} className="case-study-card__icon" />
                <span className="case-study-card__route">
                  <FlagIcon country="cn" />
                  {study.route}
                </span>
                <span className="case-study-card__demo">Illustrative example</span>
              </div>
              <div className="case-study-card__body">
                <h3>{study.title}</h3>
                <p>{study.description}</p>
                <div className="case-study-card__tags">
                  {study.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CaseStudiesSection
