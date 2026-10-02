import { ArrowUpRight } from 'lucide-react'
import { event } from '@/lib/event'

export function EventFooter() {
  return (
    <footer className="site-footer page-width">
      <div><p className="footer-title">{event.name}</p><p>{event.edition} · {event.cohort}</p></div>
      <p>Aivot Treats × Virusia Academy × Damron Confections<br /><span>{event.tagline}</span></p>
      <div className="footer-links"><a href="#register" className="inline-flex items-center gap-2">Join the programme <ArrowUpRight size={14} aria-hidden /></a><a href="/pitch">Pitch your business</a><a href="/admin">Organiser sign-in</a></div>
    </footer>
  )
}
