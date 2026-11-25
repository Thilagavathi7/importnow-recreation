import SectionHeading from '../components/ui/SectionHeading.jsx'
import faqItems from '../data/faq.js'

function FAQSection() {
  return (
    <section className="section questions" id="faq">
      <div className="section-container">
        <SectionHeading
          eyebrow="Questions"
          title="Before you import"
        />

        <div className="faq-list rv d2">
          {faqItems.map((item, index) => (
            <details className="faq-item" key={item.question} open={index === 0}>
              <summary>
                <span>{item.question}</span>
                <span className="faq-item__toggle" aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
        <p className="faq-note">
          Answers are based on the reference website and should be confirmed for
          your product and shipment.
        </p>
      </div>
    </section>
  )
}

export default FAQSection
