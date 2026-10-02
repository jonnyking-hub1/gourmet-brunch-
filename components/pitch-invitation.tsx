'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useIntake } from './use-intake'

export function PitchInvitation() {
  const { intake } = useIntake()
  return (
    <div>
      <Link href="/pitch" className="primary-link">
        {intake?.open ? 'Submit your business pitch' : 'Explore the pitch opportunity'} <ArrowUpRight size={19} aria-hidden />
      </Link>
      <p className="intake-caption" aria-live="polite">
        {intake === null ? 'Checking submission availability…' : intake.open ? 'Pitch submissions are open · All sectors welcome' : 'Pitch submissions are currently closed · All sectors welcome'}
      </p>
    </div>
  )
}
