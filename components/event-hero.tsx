import Image from 'next/image'
import { ArrowDown, ArrowUpRight, CalendarDays, Clock3, Video } from 'lucide-react'

export function EventHero() {
  return (
    <>
      <header className="site-header page-width">
        <a href="#" aria-label="Gourmet Brunch home" className="partner-brand">
          <Image src="/images/header_logos.png" alt="Aivot Treats × Virusia Academy × Damron Confections" width={8252} height={1382} sizes="(max-width: 640px) 230px, 340px" preload />
        </a>
        <a href="#register" className="header-cta">Reserve a seat <ArrowUpRight size={16} aria-hidden /></a>
      </header>
      <section className="hero page-width" aria-labelledby="event-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> A live culinary learning experience</p>
          <h1 id="event-title">Good food.<br />Great skills.<br /><em>New possibilities.</em></h1>
          <p className="hero-event-name">The Gourmet Brunch &amp;<br className="hidden sm:block" /> Commercial Snack Blueprint</p>
          <p className="hero-description">From a beautifully plated breakfast to your next business idea. Learn the recipes, techniques, and practical skills to make more of what you love.</p>
          <a className="primary-link" href="#register">Reserve your spot <ArrowUpRight size={19} aria-hidden /></a>
          <a className="curriculum-link" href="#experience">Explore what you’ll learn <ArrowDown size={15} aria-hidden /></a>
        </div>
        <div className="hero-art">
          <div className="flyer-frame">
            <Image src="/images/gourmet-brunch-flyer.jpg" alt="The Gourmet Brunch and Commercial Snack Blueprint event flyer, featuring an English breakfast spread" width={5906} height={7388} sizes="(max-width: 760px) 90vw, 460px" preload />
          </div>
          <div className="host-note"><span className="host-monogram">TO</span><div><span>Your facilitator</span><strong>Tovia Osonaike</strong><span>Aivot Treats</span></div></div>
        </div>
      </section>
      <div className="event-strip">
        <div className="page-width event-facts">
          <div><CalendarDays aria-hidden /><p><span>Save the date</span><strong>Friday, 31st July</strong></p></div>
          <div><Clock3 aria-hidden /><p><span>Make it an evening</span><strong>7:00 PM WAT</strong></p></div>
          <div><Video aria-hidden /><p><span>Join from anywhere</span><strong>Live on Google Meet</strong></p></div>
        </div>
      </div>
    </>
  )
}
