import { EventHero } from '@/components/event-hero'
import { RegistrationForm } from '@/components/registration-form'
import { EventFooter } from '@/components/event-footer'

export default function Page() {
  return (
    <main className="min-h-screen bg-[#1b120d] text-foreground">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-background shadow-2xl shadow-black/25">
        <EventHero />
        <section className="px-4 pb-8 pt-4">
          <RegistrationForm />
        </section>
        <EventFooter />
      </div>
    </main>
  )
}
