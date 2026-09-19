import Image from 'next/image'
import { Calendar, ChefHat, Clock, CookingPot, GraduationCap, Video } from 'lucide-react'

const partners = [
  { name: 'Aivot Treats', icon: ChefHat },
  { name: 'Virusia Academy', icon: GraduationCap },
  { name: 'Damron Confections', icon: CookingPot },
]

export function EventHero() {
  return (
    <header className="relative overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_55%),radial-gradient(circle_at_85%_0%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_50%)]"
      />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 pt-10 pb-8 sm:pt-14 sm:pb-10">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {partners.map((partner, index) => (
            <div key={partner.name} className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/90 px-4 py-2 shadow-sm backdrop-blur-sm">
                <partner.icon className="size-4 text-primary" aria-hidden />
                <span className="font-heading text-sm font-semibold tracking-wide text-foreground sm:text-base">
                  {partner.name}
                </span>
              </span>
              {index < partners.length - 1 ? (
                <span className="font-heading text-lg text-primary/50" aria-hidden>
                  &times;
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="w-full overflow-hidden rounded-2xl border border-border shadow-xl shadow-black/10 sm:rounded-3xl">
          <Image
            src="/images/gourmet-brunch-flyer.jpg"
            alt="Event flyer for The Gourmet Brunch and Commercial Snack Blueprint, hosted by Aivot Treats, Virusia Academy, and Damron Confections, facilitated by Tovia Osonaike, Friday 31st July 7PM WAT on Google Meet"
            width={1728}
            height={2000}
            priority
            className="h-auto w-full object-cover"
          />
        </div>

        <div className="flex w-full flex-col items-center gap-3 text-center">
          <h1 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Reserve your seat at the table
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Learn the ultimate English breakfast experience, the modern classic corndog, and the kitchen-to-cash
            blueprint for turning your skills into a real side-hustle.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-foreground sm:text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <Calendar className="size-4 text-primary" aria-hidden />
            Friday, 31st July
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <Clock className="size-4 text-primary" aria-hidden />
            7PM WAT
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <Video className="size-4 text-primary" aria-hidden />
            Google Meet
          </span>
        </div>
      </div>
    </header>
  )
}
