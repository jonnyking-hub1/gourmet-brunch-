import Image from 'next/image'
import { ArrowDown, ArrowUpRight, CalendarDays, Clock3, Video } from 'lucide-react'
import { event } from '@/lib/event'

export function EventHero() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner page-width">
          <a href="#" aria-label="Emerging Entrepreneurs Accelerator home" className="partner-brand">
            <Image
              src="/images/header_logos.png"
              alt="Aivot Treats × Virusia Academy × Damron Confections"
              width={8252}
              height={1382}
              sizes="(max-width: 760px) 230px, 340px"
              preload
            />
          </a>
          <a href="#register" className="header-cta">Join Cohort 01 <ArrowUpRight size={16} aria-hidden /></a>
        </div>
      </header>
      <section className="hero page-width" aria-labelledby="event-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> EEA · {event.edition} · {event.cohort}</p>
          <h1 id="event-title">Emerging<br />Entrepreneurs<br /><em>Accelerator.</em></h1>
          <p className="hero-event-name">{event.tagline}</p>
          <p className="hero-description">
            Build your future in food and beverage. Develop practical product skills,
            learn the business behind the product, and explore an opportunity to present your venture.
          </p>
          <a className="primary-link" href="#register">Register for Cohort 01 <ArrowUpRight size={19} aria-hidden /></a>
          <a className="curriculum-link" href="#experience">Explore the programme <ArrowDown size={15} aria-hidden /></a>
          <p className="hero-selection-note">Funding opportunities are subject to venture selection. <a href="#opportunity">See the opportunity</a>.</p>
        </div>
        <div className="hero-art">
          <div className="flyer-frame">
            <Image
              src="/images/eea-fnb-cohort-01.jpeg"
              alt="Emerging Entrepreneurs Accelerator, F&B Edition, Cohort 01 programme flyer"
              width={5914}
              height={8814}
              sizes="(max-width: 760px) 90vw, 460px"
              preload
            />
          </div>
          <div className="host-note">
            <span className="host-monogram">TO</span>
            <div><span>Your facilitator</span><strong>{event.facilitator}</strong><span>CEO, Aivot Treats</span></div>
          </div>
        </div>
      </section>
      <div className="event-strip">
        <div className="page-width event-facts">
          <div><CalendarDays aria-hidden /><p><span>Two days to build</span><strong>{event.date}</strong></p></div>
          <div><Clock3 aria-hidden /><p><span>Make it an evening</span><strong>{event.time}</strong></p></div>
          <div><Video aria-hidden /><p><span>Join from anywhere</span><strong>Live on {event.venue}</strong></p></div>
        </div>
      </div>
    </>
  )
}
