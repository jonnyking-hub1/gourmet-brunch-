import { EventHero } from '@/components/event-hero'
import { RegistrationForm } from '@/components/registration-form'
import { EventFooter } from '@/components/event-footer'
import { ArrowUpRight, ChefHat, Mic2, TrendingUp, Users, Check } from 'lucide-react'
import { selectionNote } from '@/lib/event'

const lessons = [
  {
    number: '01', icon: ChefHat, title: 'Food & beverage product experience',
    text: 'Get hands-on with food product development, practical techniques, and the skills behind a product you can build a business around.',
    detail: 'Develop your product',
  },
  {
    number: '02', icon: TrendingUp, title: 'Business & commercial training',
    text: 'Learn costing, pricing, branding, packaging, sales, and sourcing to turn your product into a profitable business.',
    detail: 'Build your business foundations',
  },
  {
    number: '03', icon: Users, title: 'The founder story',
    text: 'Learn from an entrepreneur’s real journey: the challenges, decisions, and lessons that shape a growing business.',
    detail: 'Learn from lived experience',
  },
  {
    number: '04', icon: Mic2, title: 'Venture pitch & showcase',
    text: 'Explore the opportunity to present your food or beverage business idea and showcase what you’re building.',
    detail: 'Put your idea forward',
  },
]

export default function Page() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <main id="main-content">
        <EventHero />
        <section id="experience" className="curriculum page-width" aria-labelledby="curriculum-title">
          <div className="section-heading">
            <div><p className="eyebrow">Inside the programme</p><h2 id="curriculum-title">From product skills<br /><em>to business possibilities.</em></h2></div>
            <p>Four experiences to help you take<br className="hidden sm:block" /> your next step as an F&amp;B founder.</p>
          </div>
          <div className="lesson-grid">
            {lessons.map(({ number, icon: Icon, title, text, detail }) => (
              <article className="lesson" key={number}>
                <div className="lesson-top"><Icon size={25} strokeWidth={1.4} aria-hidden /><span>{number}</span></div>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="lesson-detail">{detail}</span>
              </article>
            ))}
          </div>
        </section>
        <section id="opportunity" className="opportunity page-width" aria-labelledby="opportunity-title">
          <div className="opportunity-copy">
            <p className="eyebrow">The opportunity</p>
            <h2 id="opportunity-title">Your idea could<br /><em>be the next step.</em></h2>
            <p>Have a food or beverage business idea? The programme includes an opportunity to put it forward for consideration.</p>
            <a href="#register" className="primary-link">Start with the programme <ArrowUpRight size={19} aria-hidden /></a>
          </div>
          <div className="opportunity-detail">
            <span className="opportunity-number">Up to <strong>10</strong> ventures</span>
            <p>{selectionNote}</p>
            <p className="selection-clarification">Programme registration is separate from venture selection and does not guarantee funding or business support.</p>
          </div>
        </section>
        <section className="registration-section" aria-labelledby="registration-heading">
          <div className="page-width registration-layout">
            <div className="registration-intro">
              <p className="eyebrow">Who should join?</p>
              <h2 id="registration-heading">For the founders<br /><em>ready to begin.</em></h2>
              <p>For aspiring entrepreneurs and founders ready to build and grow in the food and beverage industry. Bring your ambition, whether you’re exploring an idea, developing a product, or already running a business.</p>
              <ul>
                {['Practical food and beverage product skills', 'Commercial knowledge for your next step', 'Founder insights and a venture showcase'].map(item => (
                  <li key={item}><Check size={17} aria-hidden />{item}</li>
                ))}
              </ul>
              <div className="registration-note"><span>EEA · F&amp;B EDITION · COHORT 01</span><p>Build something<br />worth believing in.</p></div>
            </div>
            <RegistrationForm />
          </div>
        </section>
        <EventFooter />
      </main>
    </>
  )
}
