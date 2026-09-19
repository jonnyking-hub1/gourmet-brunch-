import { EventHero } from '@/components/event-hero'
import { RegistrationForm } from '@/components/registration-form'
import { EventFooter } from '@/components/event-footer'

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <EventHero />
      <section className="mx-auto max-w-2xl px-4 pb-16">
        <RegistrationForm />
      </section>
      <EventFooter />
    </main>
  )
}
