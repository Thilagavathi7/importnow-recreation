import { ImportNowWordmark } from '../ui/BrandIcons.jsx'

const footerGroups = [
  {
    title: 'Our services',
    links: [
      { label: 'Product sourcing', href: '#services' },
      { label: 'Factory inspection', href: '#services' },
      { label: 'Quality control', href: '#services' },
      { label: 'Shipping & logistics', href: '#services' },
      { label: 'Customs clearance', href: '#services' },
      { label: 'Doorstep delivery', href: '#services' },
    ],
  },
  {
    title: 'What we import',
    links: [
      { label: 'Furniture & interiors', href: '#products' },
      { label: 'Electronics & tech', href: '#products' },
      { label: 'EV & automotive', href: '#products' },
      { label: 'Lighting', href: '#products' },
      { label: 'Supermarket goods', href: '#products' },
      { label: 'Canton Fair trips', href: '#trips' },
    ],
  },
  {
    title: 'Import guides',
    links: [
      { label: 'China business trips', href: '#trips' },
      { label: 'Delivery examples', href: '#work' },
      { label: 'Client stories', href: '#stories' },
      { label: 'Draft guide topics', href: '#blog' },
      { label: 'Before you import FAQ', href: '#faq' },
    ],
  },
]

function SiteFooter() {
  return (
    <footer className="site-footer" id="footer">
      <div className="section-container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <a className="footer-wordmark" href="#home" aria-label="ImportNow home">
              <ImportNowWordmark />
            </a>
            <p>
              End-to-end imports from China to India: sourcing, factory
              inspection, shipping and customs. This recreation labels
              illustrative examples and draft placeholders clearly.
            </p>
            <div className="site-footer__socials">
              <a
                className="site-footer__social-btn"
                href="https://www.instagram.com/importnow.in/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </a>
              <a
                className="site-footer__social-btn"
                href="#contact"
                aria-label="Quote enquiry form"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2z" />
                </svg>
              </a>
            </div>
          </div>

          {footerGroups.map((group) => (
            <nav
              className="site-footer__group"
              aria-label={group.title}
              key={group.title}
            >
              <h4>{group.title}</h4>
              <ul>
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}`}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="site-footer__contact">
            <h4>Get in touch</h4>
            <ul>
              <li>
                <b>Enquiry</b>
                <br />
                <a href="#contact">Use the quote form →</a>
              </li>
              <li>
                <b>India</b>
                <br />
                Hyderabad, Telangana
              </li>
              <li>
                <b>China</b>
                <br />
                Shanghai Shengqiao Chain Trading Co., Ltd., Shanghai
              </li>
              <li>
                <b>Instagram</b>
                <br />
                <a
                  href="https://www.instagram.com/importnow.in/"
                  target="_blank"
                  rel="noreferrer"
                >
                  @importnow.in
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="site-footer__bottom">
          <span>ImportNow website recreation</span>
          <a className="site-footer__concept" href="#home">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
