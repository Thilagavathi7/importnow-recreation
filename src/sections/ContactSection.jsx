import { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import SectionHeading from '../components/ui/SectionHeading.jsx'
import {
  hasConfiguredWhatsApp,
  WHATSAPP_PHONE,
} from '../config/contact.js'
import { buildWhatsAppMessage } from '../features/quote-form/quoteMessage.js'

function ContactSection() {
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const enquiry = Object.fromEntries(formData.entries())

    setMessage(
      buildWhatsAppMessage({
        name: enquiry.name,
        city: enquiry.city,
        product: enquiry.product,
        quantity: enquiry.quantity,
        budget: enquiry.budget,
        details: enquiry.details,
      }),
    )
  }

  const whatsappUrl = hasConfiguredWhatsApp
    ? `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
    : null

  return (
    <section className="section contact-section" id="contact">
      <div className="section-container contact-section__grid">
        <div className="contact-section__intro">
          <SectionHeading
            eyebrow="Start importing"
            title={
              <>
                Tell us what you want to import.{' '}
                <span className="accent-text">We&apos;ll take it from there.</span>
              </>
            }
            description="Share the product and quantity to prepare a sourcing enquiry message locally in your browser."
          />

          <div className="contact-details">
            <div className="contact-detail rv d2">
              <span className="contact-detail__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 5h18v14H3zM3 6l9 7 9-7" />
                </svg>
              </span>
              <span>
                <small>Enquiry</small>
                <strong>Use the quote form</strong>
              </span>
            </div>
            <a
              className="contact-detail rv d3"
              href="https://www.instagram.com/importnow.in/"
              target="_blank"
              rel="noreferrer"
            >
              <span className="contact-detail__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <span>
                <small>Instagram</small>
                <strong>@importnow.in</strong>
              </span>
            </a>
            <div className="contact-detail rv d4">
              <span className="contact-detail__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </span>
              <span>
                <small>Offices</small>
                <strong>Hyderabad, India · Shanghai, China</strong>
              </span>
            </div>
          </div>
          <p className="contact-section__privacy">
            The form prepares a message in your browser. It does not send data
            unless you choose to open WhatsApp after a verified number is
            configured.
          </p>
        </div>

        <form className="quote-form rv d2" onSubmit={handleSubmit}>
          <h3>Get a free sourcing quote</h3>
          <div className="quote-form__row">
            <label className="form-field">
              <span>Your name *</span>
              <input
                autoComplete="name"
                name="name"
                required
                maxLength="100"
                placeholder="Full name"
              />
            </label>
            <label className="form-field">
              <span>City *</span>
              <input
                autoComplete="address-level2"
                name="city"
                required
                maxLength="100"
                placeholder="e.g. Hyderabad"
              />
            </label>
          </div>
          <label className="form-field">
            <span>What do you want to import? *</span>
            <input
              name="product"
              required
              maxLength="160"
              placeholder="Product or category"
            />
          </label>
          <div className="quote-form__row">
            <label className="form-field">
              <span>Approximate quantity *</span>
              <input
                name="quantity"
                required
                maxLength="80"
                placeholder="e.g. 1 container"
              />
            </label>
            <label className="form-field">
              <span>Budget (optional)</span>
              <input
                name="budget"
                maxLength="100"
                placeholder="Budget range"
              />
            </label>
          </div>
          <label className="form-field">
            <span>Details (optional)</span>
            <textarea
              name="details"
              rows="3"
              maxLength="1000"
              placeholder="Product, specs, reference photos or links…"
            />
          </label>
          <Button type="submit">Prepare WhatsApp enquiry →</Button>
          <p className="quote-form__note">
            Required fields are marked *. Your enquiry stays in this browser
            until you choose to share it.
          </p>

          {message && (
            <div className="quote-result" aria-live="polite">
              <label className="form-field" htmlFor="generated-message">
                <span>Generated enquiry message</span>
                <textarea
                  id="generated-message"
                  readOnly
                  rows="8"
                  value={message}
                />
              </label>
              {whatsappUrl ? (
                <a
                  className="button button--primary"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open WhatsApp
                </a>
              ) : (
                <p className="quote-result__notice">
                  WhatsApp is not connected yet. Replace the placeholder in{' '}
                  <code>src/config/contact.js</code> with a verified number to
                  enable the chat link. You can select and copy this message.
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  )
}

export default ContactSection
