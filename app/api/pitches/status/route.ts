import { getIntake, recordsConfigured } from '@/lib/server/store'
import { decksConfigured } from '@/lib/server/decks'
import { json } from '@/lib/server/http'

export async function GET() {
  if (!recordsConfigured() || !decksConfigured()) return json({ open: false, available: false })
  try {
    const response = json({ open: await getIntake(), available: true })
    // Only the public on/off state is cached. Submissions check the database directly.
    response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=10')
    return response
  }
  catch { return json({ open: false, available: false }, 503) }
}
