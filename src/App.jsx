import { useEffect } from 'react'
import SiteHeader from './components/layout/SiteHeader.jsx'
import SiteFooter from './components/layout/SiteFooter.jsx'
import WhatsAppButton from './components/layout/WhatsAppButton.jsx'
import ChinaPresenceSection from './sections/ChinaPresenceSection.jsx'
import BusinessTripsSection from './sections/BusinessTripsSection.jsx'
import CaseStudiesSection from './sections/CaseStudiesSection.jsx'
import ContactSection from './sections/ContactSection.jsx'
import FAQSection from './sections/FAQSection.jsx'
import GuidesSection from './sections/GuidesSection.jsx'
import HeroSection from './sections/HeroSection.jsx'
import ProductCategoriesSection from './sections/ProductCategoriesSection.jsx'
import RouteMarquee from './sections/RouteMarquee.jsx'
import ServicesSection from './sections/ServicesSection.jsx'
import ShipmentJourneySection from './sections/ShipmentJourneySection.jsx'
import TestimonialsSection from './sections/TestimonialsSection.jsx'
import './App.css'

function splitHeadlineWords(element) {
  if (element.dataset.splitDone === 'true') return
  element.dataset.splitDone = 'true'
  let index = 0

  function walk(node) {
    ;[...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const fragment = document.createDocumentFragment()
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(' '))
            return
          }
          const wordWrap = document.createElement('span')
          wordWrap.className = 'w'
          const wordInner = document.createElement('span')
          wordInner.className = 'wi'
          wordInner.style.setProperty('--i', String(index))
          index += 1
          wordInner.textContent = part
          wordWrap.appendChild(wordInner)
          fragment.appendChild(wordWrap)
        })
        child.replaceWith(fragment)
      } else if (child.nodeType === 1 && !/^(BR|SVG)$/i.test(child.tagName)) {
        walk(child)
      }
    })
  }

  walk(element)
  element.classList.add('split', 'rv')
}

function App() {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (!reducedMotion) {
      document
        .querySelectorAll('.hero-section__title, .section-heading__title')
        .forEach(splitHeadlineWords)
    }

    const revealTargets = document.querySelectorAll('.rv')
    let observer

    if (reducedMotion) {
      revealTargets.forEach((target) => target.classList.add('in'))
    } else if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -30px 0px' },
      )

      revealTargets.forEach((target) => observer.observe(target))
    } else {
      revealTargets.forEach((target) => target.classList.add('in'))
    }

    const progressBar = document.querySelector('.page-progress')
    let frame = 0

    function updateProgress() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const scrollableHeight =
          document.documentElement.scrollHeight - window.innerHeight
        const progress =
          scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0
        progressBar?.style.setProperty('transform', `scaleX(${progress})`)
      })
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    updateProgress()

    const finePointer =
      !reducedMotion &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const tiltCleanups = []

    if (finePointer) {
      document.querySelectorAll('.tilt').forEach((card) => {
        function onMove(event) {
          const rect = card.getBoundingClientRect()
          const x = (event.clientX - rect.left) / rect.width
          const y = (event.clientY - rect.top) / rect.height
          card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`
          card.style.setProperty('--mx', `${x * 100}%`)
          card.style.setProperty('--my', `${y * 100}%`)
        }
        function onLeave() {
          card.style.transform = ''
        }
        card.addEventListener('pointermove', onMove)
        card.addEventListener('pointerleave', onLeave)
        tiltCleanups.push(() => {
          card.removeEventListener('pointermove', onMove)
          card.removeEventListener('pointerleave', onLeave)
        })
      })
    }

    return () => {
      observer?.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
      tiltCleanups.forEach((cleanup) => cleanup())
    }
  }, [])

  return (
    <>
      <div className="page-progress" aria-hidden="true" />
      <SiteHeader />
      <main>
        <HeroSection />
        <RouteMarquee />
        <ServicesSection />
        <ShipmentJourneySection />
        <ProductCategoriesSection />
        <ChinaPresenceSection />
        <BusinessTripsSection />
        <CaseStudiesSection />
        <TestimonialsSection />
        <GuidesSection />
        <FAQSection />
        <ContactSection />
      </main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  )
}

export default App
