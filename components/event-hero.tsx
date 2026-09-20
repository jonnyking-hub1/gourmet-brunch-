import Image from 'next/image'
import { Calendar, ChefHat, Clock, CookingPot, GraduationCap, Video } from 'lucide-react'

const partners = [
  { name: 'Aivot Treats', icon: ChefHat },
  { name: 'Virusia Academy', icon: GraduationCap },
  { name: 'Damron Confections', icon: CookingPot },
]

export function EventHero() {
  return (
    <header className="relative isolate overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/background.jpg"
          alt=""
          fill
          priority
          className="scale-105 object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,12,8,0.24)_0%,rgba(20,12,8,0.08)_42%,rgba(251,241,222,0.88)_100%)]" />
      </div>

      <div className="relative flex min-h-[72vh] flex-col justify-between px-4 pb-6 pt-4 text-white">
        <div className="fixed left-1/2 top-3 z-30 flex w-full max-w-[430px] -translate-x-1/2 justify-center px-4">
          <div className="w-full max-w-[300px] rounded-2xl border border-white/12 bg-black/18 px-3 py-2 text-center shadow-lg shadow-black/10 backdrop-blur-md">
            <Image
              src="/images/header_logos.png"
              alt="Aivot Treats, Virusia Academy, and Damron Confections logos"
              width={1200}
              height={360}
              className="h-auto w-full object-contain"
              priority
            />
            <div className="mt-0.5 text-center">
              <p className="eater-regular text-[13px] leading-none tracking-[0.16em] text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                presents
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-end">
          <div className="rounded-t-[2rem] border border-white/15 bg-black/22 p-5 backdrop-blur-md">
            <div className="flex w-full flex-col items-center gap-3 text-center text-white">
              <h1 className="font-heading text-3xl font-extrabold leading-tight sm:text-[2.4rem]">
                Reserve your seat at the table
              </h1>
              <p className="max-w-xl text-sm text-white/90 sm:text-base">
                Learn the ultimate English breakfast experience, the modern classic corndog, and the kitchen-to-cash
                blueprint for turning your skills into a real side-hustle.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-white sm:text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2">
                <Calendar className="size-4 text-white" aria-hidden />
                Friday, 31st July
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2">
                <Clock className="size-4 text-white" aria-hidden />
                7PM WAT
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2">
                <Video className="size-4 text-white" aria-hidden />
                Google Meet
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}