import { EventHero } from '@/components/event-hero'
import { RegistrationForm } from '@/components/registration-form'
import { EventFooter } from '@/components/event-footer'
import { ArrowUpRight, ChefHat, Coffee, TrendingUp, Check } from 'lucide-react'

const lessons = [
  { number: '01', icon: Coffee, title: 'The ultimate English breakfast', text: 'Bring the brunch experience home. Learn aesthetic plating for a restaurant-quality English breakfast.', detail: 'Cook with confidence' },
  { number: '02', icon: ChefHat, title: 'The modern classic corndog', text: 'Master the batter and the crunch of a crowd-favourite snack for events and campus sales.', detail: 'Perfect your technique' },
  { number: '03', icon: TrendingUp, title: 'The kitchen-to-cash blueprint', text: 'Explore costing, packaging, and budget sourcing to turn what you learn into a side hustle.', detail: 'Build your next idea' },
]

export default function Page() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <main id="main-content">
        <EventHero />
        <section id="experience" className="curriculum page-width" aria-labelledby="curriculum-title">
          <div className="section-heading"><div><p className="eyebrow">On the menu</p><h2 id="curriculum-title">A little inspiration.<br /><em>A lot to take away.</em></h2></div><p>For the food lovers, the curious cooks,<br className="hidden sm:block" /> and the entrepreneurs in the making.</p></div>
          <div className="lesson-grid">{lessons.map(({ number, icon: Icon, title, text, detail }) => (
            <article className="lesson" key={number}><div className="lesson-top"><Icon size={25} strokeWidth={1.4} aria-hidden /><span>{number}</span></div><h3>{title}</h3><p>{text}</p><span className="lesson-detail">{detail}<ArrowUpRight size={16} aria-hidden /></span></article>
          ))}</div>
        </section>
        <section className="registration-section" aria-labelledby="registration-heading">
          <div className="page-width registration-layout">
            <div className="registration-intro"><p className="eyebrow">Your place at the table</p><h2 id="registration-heading">Come curious.<br /><em>Leave inspired.</em></h2><p>Whether you’re cooking for the joy of it or getting ready to start something of your own, there’s a seat for you.</p><ul>{['Practical cooking and plating skills', 'Ideas for your food business', 'A live session with Tovia Osonaike'].map(item => <li key={item}><Check size={17} aria-hidden />{item}</li>)}</ul><div className="registration-note"><span>THE GOURMET BRUNCH</span><p>Good things start<br />around the table.</p></div></div>
            <RegistrationForm />
          </div>
        </section>
        <EventFooter />
      </main>
    </>
  )
}
