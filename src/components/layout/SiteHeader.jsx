import { useEffect, useState } from 'react'
import { ImportNowWordmark } from '../ui/BrandIcons.jsx'
import Button from '../ui/Button.jsx'

const navigationLinks = [
  { label: 'Services', href: '#services' },
  { label: 'How it works', href: '#journey' },
  { label: 'What we import', href: '#products' },
  { label: 'China trips', href: '#trips' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '#contact' },
]

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    function updateHeader() {
      setIsScrolled(window.scrollY > 30)
    }

    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header
      className={`site-header${isScrolled ? ' is-scrolled' : ''}${menuOpen ? ' menu-open' : ''}`}
      id="nav"
    >
      <div className="site-header__inner">
        <a
          className="wordmark"
          href="#home"
          aria-label="ImportNow home"
          onClick={closeMenu}
        >
          <ImportNowWordmark />
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`primary-navigation${menuOpen ? ' is-open' : ''}`}
          id="primary-navigation"
          aria-label="Main navigation"
        >
          <div className="primary-navigation__links">
            {navigationLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={closeMenu}>
                {link.label}
              </a>
            ))}
          </div>
          <Button
            href="#contact"
            className="site-header__cta"
            onClick={closeMenu}
          >
            Get a free quote
          </Button>
        </nav>
      </div>
    </header>
  )
}

export default SiteHeader
