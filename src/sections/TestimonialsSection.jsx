import SectionHeading from '../components/ui/SectionHeading.jsx'
import testimonialPlaceholders from '../data/testimonialPlaceholders.js'

function TestimonialsSection() {
  return (
    <section className="section testimonials" id="stories">
      <div className="section-container">
        <SectionHeading
          eyebrow="Client stories"
          title={
            <>
              Heard from the people{' '}
              <span className="accent-text">who made the trip.</span>
            </>
          }
          description="Testimonials are intentionally left unpublished here until approved customer quotes are provided."
        />

        <div className="testimonials__grid">
          {testimonialPlaceholders.map((item, index) => (
            <article
              className={`testimonial-placeholder rv${index > 0 ? ` d${index}` : ''}`}
              key={item.label}
            >
              <p className="testimonial-placeholder__quote-text">
                Approved customer feedback for {item.label.toLowerCase()} will
                appear here. No customer quote or identity has been invented.
              </p>
              <div className="testimonial-placeholder__who">
                <span className="testimonial-placeholder__avatar" aria-hidden="true">
                  {item.label.slice(0, 1)}
                </span>
                <div>
                  <strong className="testimonial-placeholder__label">
                    {item.label}
                  </strong>
                  <span className="testimonial-placeholder__status">
                    Awaiting approved testimonial
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
