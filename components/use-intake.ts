'use client'

import { useCallback, useEffect, useState } from 'react'
import type { IntakeState } from '@/lib/pitch'

export function useIntake() {
  const [intake, setIntake] = useState<IntakeState | null>(null)
  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch('/api/pitches/status', { cache: 'no-store', signal })
      const data = await response.json()
      if (!signal?.aborted) setIntake({ open: response.ok && data.open === true, available: response.ok && data.available === true })
    } catch {
      if (!signal?.aborted) setIntake({ open: false, available: false })
    }
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    const update = () => { void refresh(controller.signal) }
    update()
    const interval = setInterval(update, 30_000)
    window.addEventListener('focus', update)
    return () => { controller.abort(); clearInterval(interval); window.removeEventListener('focus', update) }
  }, [refresh])
  return { intake, refresh }
}
