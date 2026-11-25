import { FlagIcon } from '../components/ui/BrandIcons.jsx'
import Button from '../components/ui/Button.jsx'
import LineIcon from '../components/ui/LineIcon.jsx'
import SectionHeading from '../components/ui/SectionHeading.jsx'
import guideTopics from '../data/guideTopics.js'

function GuidesSection() {
  return (
    <section className="section import-guides" id="blog">
      <div className="section-container">
        <div className="import-guides__heading">
          <SectionHeading
            eyebrow="Import guides"
            title={
              <>
                Learn before <span className="accent-text">you import.</span>
              </>
            }
            description="Practical topics around sourcing, shipping and product research."
          />
          <span className="import-guides__notice">Sample topics · Draft content</span>
        </div>

        <div className="import-guides__grid">
          {guideTopics.map((topic, index) => (
            <article
              className={`guide-card rv d${(index % 2) + 1}`}
              key={topic.title}
            >
              <div className={`guide-card__cover ${topic.tone}`}>
                <span className="guide-card__cover-bg" aria-hidden="true" />
                <LineIcon name={topic.icon} className="guide-card__cover-icon" />
                <span className="guide-card__category">{topic.category}</span>
                <span className="guide-card__flags" aria-hidden="true">
                  <FlagIcon country="cn" />→<FlagIcon country="in" />
                </span>
                <span className="guide-card__cover-title">{topic.coverTitle}</span>
              </div>
              <div className="guide-card__body">
                <span className="guide-card__draft">Draft guide topic</span>
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
                <Button href="#contact" className="guide-card__read-more">
                  Request topic info <span aria-hidden="true">→</span>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GuidesSection
